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


def generate_baseline_forecasts(db: Session, user_id: int | None = None):
    forecast_date = date.today()
    created_count = 0
    updated_count = 0

    products_query = db.query(Product)

    if user_id is not None:
        products_query = products_query.filter(Product.user_id == user_id)

    products = products_query.all()

    for product in products:
        orders_query = db.query(func.coalesce(func.sum(Order.quantity), 0)).filter(
            Order.product_id == product.id,
        )

        if user_id is not None:
            orders_query = orders_query.filter(Order.user_id == user_id)

        total_order_quantity = orders_query.scalar()

        predicted_demand = calculate_predicted_demand(
            Decimal(total_order_quantity),
            Decimal(product.reorder_threshold),
        )

        existing_forecast_query = db.query(Forecast).filter(
            Forecast.product_id == product.id,
            Forecast.forecast_date == forecast_date,
            Forecast.model_version == MODEL_VERSION,
        )

        if user_id is not None:
            existing_forecast_query = existing_forecast_query.filter(
                Forecast.user_id == user_id,
            )

        existing_forecast = existing_forecast_query.first()

        if existing_forecast:
            existing_forecast.predicted_demand = predicted_demand
            updated_count += 1
        else:
            forecast = Forecast(
                user_id=user_id,
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