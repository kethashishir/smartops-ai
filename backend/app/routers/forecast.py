from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.auth.security import get_current_user
from app.database import get_db
from app.models.forecast import Forecast
from app.models.orders import Order
from app.models.product import Product
from app.models.user import User
from app.schemas.forecast import ForecastCreate, ForecastResponse
from app.services.forecast_service import (
    MODEL_VERSION,
    build_forecast_explanation,
    calculate_demand_volatility_score,
    generate_baseline_forecasts,
    get_volatility_level,
)

router = APIRouter(prefix="/forecast", tags=["forecast"])


def get_order_quantities(
    db: Session,
    product_id: int,
    user_id: int,
) -> list[int]:
    rows = (
        db.query(Order.quantity)
        .filter(
            Order.user_id == user_id,
            Order.product_id == product_id,
        )
        .order_by(Order.order_time.asc(), Order.id.asc())
        .all()
    )

    return [quantity for (quantity,) in rows]


def get_forecast_context(
    db: Session,
    forecast: Forecast,
    product: Product,
    user_id: int,
) -> dict:
    total_order_quantity, order_count = (
        db.query(
            func.coalesce(func.sum(Order.quantity), 0),
            func.count(Order.id),
        )
        .filter(
            Order.user_id == user_id,
            Order.product_id == product.id,
        )
        .first()
    )

    order_quantities = get_order_quantities(db, product.id, user_id)
    volatility_score = calculate_demand_volatility_score(order_quantities)
    volatility_level = get_volatility_level(volatility_score, int(order_count))

    explanation = build_forecast_explanation(
        Decimal(total_order_quantity),
        Decimal(product.reorder_threshold),
        int(order_count),
        Decimal(forecast.predicted_demand),
        volatility_level,
        volatility_score,
    )

    return {
        "explanation": explanation,
        "volatility_level": volatility_level,
        "volatility_score": volatility_score,
    }


def build_forecast_response(
    forecast: Forecast,
    product: Product,
    context: dict | None = None,
) -> dict:
    context = context or {}

    return {
        "id": forecast.id,
        "user_id": forecast.user_id,
        "product_id": forecast.product_id,
        "product_name": product.name,
        "forecast_date": forecast.forecast_date,
        "predicted_demand": forecast.predicted_demand,
        "model_version": forecast.model_version,
        "explanation": context.get("explanation"),
        "volatility_level": context.get("volatility_level"),
        "volatility_score": context.get("volatility_score"),
    }


@router.get("/", response_model=list[ForecastResponse])
def get_forecast(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    forecast_rows = (
        db.query(Forecast, Product)
        .join(Product, Product.id == Forecast.product_id)
        .filter(
            Forecast.user_id == current_user.id,
            Product.user_id == current_user.id,
            Forecast.model_version == MODEL_VERSION,
        )
        .order_by(Product.name.asc(), Forecast.forecast_date.desc(), Forecast.id.desc())
        .all()
    )

    return [
        build_forecast_response(
            forecast,
            product,
            get_forecast_context(db, forecast, product, current_user.id),
        )
        for forecast, product in forecast_rows
    ]


@router.get("/latest", response_model=list[ForecastResponse])
def get_latest_forecasts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    forecast_rows = (
        db.query(Forecast, Product)
        .join(Product, Product.id == Forecast.product_id)
        .filter(
            Forecast.user_id == current_user.id,
            Product.user_id == current_user.id,
            Forecast.model_version == MODEL_VERSION,
        )
        .order_by(
            Product.name.asc(),
            Forecast.forecast_date.desc(),
            Forecast.id.desc(),
        )
        .all()
    )

    latest_by_product_id = {}

    for forecast, product in forecast_rows:
        existing_row = latest_by_product_id.get(forecast.product_id)

        if not existing_row:
            latest_by_product_id[forecast.product_id] = (
                forecast,
                product,
            )
            continue

        existing_forecast, _ = existing_row

        if (
            forecast.forecast_date > existing_forecast.forecast_date
            or (
                forecast.forecast_date == existing_forecast.forecast_date
                and forecast.id > existing_forecast.id
            )
        ):
            latest_by_product_id[forecast.product_id] = (
                forecast,
                product,
            )

    latest_rows = sorted(
        latest_by_product_id.values(),
        key=lambda row: row[1].name.lower(),
    )

    return [
        build_forecast_response(
            forecast,
            product,
            get_forecast_context(db, forecast, product, current_user.id),
        )
        for forecast, product in latest_rows
    ]


@router.post("/generate")
def generate_forecasts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return generate_baseline_forecasts(db, user_id=current_user.id)


# Just for testing. In production, forecasts should be generated by the ML pipeline.
@router.post("/", response_model=ForecastResponse)
def create_forecast(
    forecast: ForecastCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    product = (
        db.query(Product)
        .filter(
            Product.id == forecast.product_id,
            Product.user_id == current_user.id,
        )
        .first()
    )

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    db_forecast = Forecast(
        user_id=current_user.id,
        product_id=forecast.product_id,
        forecast_date=forecast.forecast_date,
        predicted_demand=forecast.predicted_demand,
        model_version=forecast.model_version,
    )

    db.add(db_forecast)
    db.commit()
    db.refresh(db_forecast)

    return build_forecast_response(
        db_forecast,
        product,
        {
            "explanation": "Manually created forecast record. Generate forecasts to use the trend-aware model explanation.",
            "volatility_level": "insufficient history",
            "volatility_score": 0,
        },
    )