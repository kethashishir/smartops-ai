import os
import sys
from datetime import date
from decimal import Decimal

from dotenv import load_dotenv
from sqlalchemy import create_engine, func
from sqlalchemy.orm import sessionmaker


PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
BACKEND_PATH = os.path.join(PROJECT_ROOT, "backend")

if BACKEND_PATH not in sys.path:
    sys.path.append(BACKEND_PATH)

from app.models.forecast import Forecast
from app.models.orders import Order
from app.models.product import Product


MODEL_VERSION = "baseline-v1"


def get_database_url():
    load_dotenv(os.path.join(PROJECT_ROOT, ".env"))

    database_url = os.getenv("DATABASE_URL")

    if not database_url:
        raise ValueError("DATABASE_URL is not set")

    return database_url


def calculate_predicted_demand(total_order_quantity, reorder_threshold):
    baseline = max(total_order_quantity, reorder_threshold)
    predicted_demand = baseline * Decimal("1.15")

    return predicted_demand.quantize(Decimal("0.01"))


def generate_forecasts():
    database_url = get_database_url()

    engine = create_engine(database_url, echo=False)
    Session = sessionmaker(bind=engine)

    forecast_date = date.today()
    created_count = 0
    updated_count = 0

    with Session() as session:
        products = session.query(Product).all()

        for product in products:
            total_order_quantity = (
                session.query(func.coalesce(func.sum(Order.quantity), 0))
                .filter(Order.product_id == product.id)
                .scalar()
            )

            predicted_demand = calculate_predicted_demand(
                Decimal(total_order_quantity),
                Decimal(product.reorder_threshold),
            )

            existing_forecast = (
                session.query(Forecast)
                .filter(
                    Forecast.product_id == product.id,
                    Forecast.forecast_date == forecast_date,
                    Forecast.model_version == MODEL_VERSION,
                )
                .first()
            )

            if existing_forecast:
                existing_forecast.predicted_demand = predicted_demand
                updated_count += 1
            else:
                forecast = Forecast(
                    product_id=product.id,
                    forecast_date=forecast_date,
                    predicted_demand=predicted_demand,
                    model_version=MODEL_VERSION,
                )

                session.add(forecast)
                created_count += 1

        session.commit()

    print(
        f"Forecast generation complete using {MODEL_VERSION}. "
        f"Created: {created_count}. Updated: {updated_count}."
    )


if __name__ == "__main__":
    generate_forecasts()