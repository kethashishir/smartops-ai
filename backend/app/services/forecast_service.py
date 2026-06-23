from datetime import date
from decimal import Decimal

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.ml.forecasting_model import ML_MODEL_VERSION, predict_demand_with_ml
from app.models.forecast import Forecast
from app.models.orders import Order
from app.models.product import Product


MODEL_VERSION = ML_MODEL_VERSION


def calculate_trend_multiplier(order_count: int) -> Decimal:
    if order_count >= 8:
        return Decimal("1.30")

    if order_count >= 4:
        return Decimal("1.20")

    if order_count >= 1:
        return Decimal("1.10")

    return Decimal("1.00")


def calculate_demand_volatility_score(order_quantities: list[int]) -> int:
    if len(order_quantities) < 2:
        return 0

    average_quantity = sum(order_quantities) / len(order_quantities)

    if average_quantity == 0:
        return 0

    average_deviation = sum(
        abs(quantity - average_quantity) for quantity in order_quantities
    ) / len(order_quantities)

    volatility_ratio = average_deviation / average_quantity

    return min(round(volatility_ratio * 100), 100)


def get_volatility_level(volatility_score: int, order_count: int) -> str:
    if order_count < 2:
        return "insufficient history"

    if volatility_score >= 60:
        return "high"

    if volatility_score >= 25:
        return "moderate"

    return "stable"


def build_forecast_explanation(
    total_order_quantity: Decimal,
    reorder_threshold: Decimal,
    order_count: int,
    predicted_demand: Decimal,
    volatility_level: str | None = None,
    volatility_score: int | None = None,
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

    volatility_sentence = ""

    if volatility_level:
        volatility_sentence = (
            f" Demand volatility is {volatility_level}"
            f" with a score of {volatility_score}."
        )

    return (
        f"ML-assisted forecast used {total_order_quantity} total ordered units "
        f"across {order_count} order(s), with an average order size of "
        f"{average_order_quantity.quantize(Decimal('0.01'))}. "
        f"The model detected {activity_level}; {demand_basis}. "
        f"Final predicted demand is {predicted_demand}."
        f"{volatility_sentence}"
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


def calculate_ml_predicted_demand(
    reorder_threshold: Decimal,
    order_quantities: list[int],
) -> Decimal:
    volatility_score = calculate_demand_volatility_score(order_quantities)
    trend_multiplier = calculate_trend_multiplier(len(order_quantities))

    return predict_demand_with_ml(
        reorder_threshold=reorder_threshold,
        order_quantities=order_quantities,
        volatility_score=volatility_score,
        trend_multiplier=trend_multiplier,
    )


def calculate_forecast_demand(
    total_order_quantity: Decimal,
    reorder_threshold: Decimal,
    order_count: int,
    order_quantities: list[int],
) -> Decimal:
    try:
        return calculate_ml_predicted_demand(
            reorder_threshold=reorder_threshold,
            order_quantities=order_quantities,
        )
    except Exception:
        return calculate_predicted_demand(
            total_order_quantity=total_order_quantity,
            reorder_threshold=reorder_threshold,
            order_count=order_count,
        )


def get_order_quantities_for_product(
    db: Session,
    product_id: int,
    user_id: int | None = None,
) -> list[int]:
    order_query = (
        db.query(Order.quantity)
        .filter(Order.product_id == product_id)
        .order_by(Order.order_time.asc(), Order.id.asc())
    )

    if user_id is not None:
        order_query = order_query.filter(Order.user_id == user_id)

    rows = order_query.all()

    return [quantity for (quantity,) in rows]


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

        order_quantities = get_order_quantities_for_product(
            db=db,
            product_id=product.id,
            user_id=user_id,
        )

        predicted_demand = calculate_forecast_demand(
            total_order_quantity=Decimal(total_order_quantity),
            reorder_threshold=Decimal(product.reorder_threshold),
            order_count=int(order_count),
            order_quantities=order_quantities,
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