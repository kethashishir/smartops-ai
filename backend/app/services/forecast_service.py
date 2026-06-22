from datetime import date
from decimal import Decimal

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.forecast import Forecast
from app.models.orders import Order
from app.models.product import Product


MODEL_VERSION = "trend-aware-v2"


def calculate_trend_multiplier(order_count: int) -> Decimal:
    if order_count >= 8:
        return Decimal("1.30")

    if order_count >= 4:
        return Decimal("1.20")

    if order_count >= 1:
        return Decimal("1.10")

    return Decimal("1.00")

def build_forecast_explanation(
    total_order_quantity: Decimal,
    reorder_threshold: Decimal,
    order_count: int,
    predicted_demand: Decimal,
) -> str:
    if order_count >= 8:
        activity_level = "high order activity"
    elif order_count >= 4:
        activity_level = "medium order activity"
    elif order_count >= 1:
        activity_level = "light order activity"
    else:
        activity_level = "no order history"

    if order_count > 0:
        average_order_quantity = total_order_quantity / Decimal(order_count)
    else:
        average_order_quantity = Decimal("0")

    if total_order_quantity >= reorder_threshold:
        demand_basis = "historical demand is above the reorder threshold"
    else:
        demand_basis = "the reorder threshold is the strongest demand signal"

    return (
        f"Trend-aware forecast used {total_order_quantity} total ordered units "
        f"across {order_count} order(s), with an average order size of "
        f"{average_order_quantity.quantize(Decimal('0.01'))}. "
        f"The model detected {activity_level}; {demand_basis}. "
        f"Final predicted demand is {predicted_demand}."
    )

def calculate_predicted_demand(
    total_order_quantity: Decimal,
    reorder_threshold: Decimal,
    order_count: int = 0,
) -> Decimal:
    if order_count >= 2:
        average_order_quantity = total_order_quantity / Decimal(order_count)
        average_order_signal = average_order_quantity * Decimal("3")
    else:
        average_order_signal = Decimal("0")

    demand_signal = max(
        total_order_quantity,
        reorder_threshold,
        average_order_signal,
    )

    predicted_demand = demand_signal * calculate_trend_multiplier(order_count)

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
        order_stats_query = db.query(
            func.coalesce(func.sum(Order.quantity), 0),
            func.count(Order.id),
        ).filter(
            Order.product_id == product.id,
        )

        if user_id is not None:
            order_stats_query = order_stats_query.filter(Order.user_id == user_id)

        total_order_quantity, order_count = order_stats_query.first()

        predicted_demand = calculate_predicted_demand(
            Decimal(total_order_quantity),
            Decimal(product.reorder_threshold),
            int(order_count),
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