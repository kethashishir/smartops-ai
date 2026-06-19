from datetime import date
from decimal import Decimal

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.forecast import Forecast
from app.models.orders import Order
from app.models.product import Product


MODEL_VERSION = "baseline-v1"


def calculate_predicted_demand(total_order_quantity, reorder_threshold):
    baseline = max(total_order_quantity, reorder_threshold)
    predicted_demand = baseline * Decimal("1.15")

    return predicted_demand.quantize(Decimal("0.01"))


def generate_baseline_forecasts(db: Session):
    forecast_date = date.today()
    created_count = 0
    updated_count = 0

    products = db.query(Product).all()

    for product in products:
        total_order_quantity = (
            db.query(func.coalesce(func.sum(Order.quantity), 0))
            .filter(Order.product_id == product.id)
            .scalar()
        )

        predicted_demand = calculate_predicted_demand(
            Decimal(total_order_quantity),
            Decimal(product.reorder_threshold),
        )

        existing_forecast = (
            db.query(Forecast)
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

            db.add(forecast)
            created_count += 1

    db.commit()

    return {
        "model_version": MODEL_VERSION,
        "forecast_date": forecast_date,
        "created_count": created_count,
        "updated_count": updated_count,
    }