from __future__ import annotations

import os
import sys
from decimal import Decimal
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker


PROJECT_ROOT = Path(__file__).resolve().parents[3]
BACKEND_PATH = PROJECT_ROOT / "backend"

if str(BACKEND_PATH) not in sys.path:
    sys.path.append(str(BACKEND_PATH))

from app.ml.forecasting_model import build_feature_row, save_model_artifact
from app.models.orders import Order
from app.models.product import Product
from app.services.forecast_service import (
    calculate_demand_volatility_score,
    calculate_trend_multiplier,
)


def get_database_url() -> str:
    load_dotenv(PROJECT_ROOT / ".env")

    database_url = os.getenv("DATABASE_URL")

    if not database_url:
        raise ValueError("DATABASE_URL is not set")

    return database_url


def build_training_rows(session) -> list:
    products = session.query(Product).all()
    training_rows = []

    for product in products:
        order_rows = (
            session.query(Order.quantity)
            .filter(Order.product_id == product.id)
            .order_by(Order.order_time.asc(), Order.id.asc())
            .all()
        )

        order_quantities = [quantity for (quantity,) in order_rows]
        volatility_score = calculate_demand_volatility_score(order_quantities)
        trend_multiplier = calculate_trend_multiplier(len(order_quantities))

        training_rows.append(
            build_feature_row(
                reorder_threshold=Decimal(product.reorder_threshold),
                order_quantities=order_quantities,
                volatility_score=volatility_score,
                trend_multiplier=trend_multiplier,
            )
        )

    return training_rows


def main():
    database_url = get_database_url()

    engine = create_engine(database_url, echo=False)
    Session = sessionmaker(bind=engine)

    with Session() as session:
        training_rows = build_training_rows(session)
        artifact = save_model_artifact(training_rows)

    print(
        f"Saved {artifact['model_version']} with "
        f"{artifact['metrics']['training_rows']} training rows. "
        f"MAE: {artifact['metrics']['mean_absolute_error']}"
    )


if __name__ == "__main__":
    main()
