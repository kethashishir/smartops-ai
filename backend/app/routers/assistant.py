from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.auth.security import get_current_user
from app.database import get_db
from app.models.forecast import Forecast
from app.models.inventories import Inventory
from app.models.orders import Order
from app.models.product import Product
from app.models.recommendation import Recommendation
from app.models.user import User
from app.schemas.assistant import AssistantQuestion, AssistantResponse

router = APIRouter(prefix="/assistant", tags=["assistant"])

def format_quantity(value) -> str:
    return f"{float(value):.2f}"

def get_user_products_with_inventory(db: Session, user_id: int):
    return (
        db.query(Product, Inventory)
        .outerjoin(Inventory, Inventory.product_id == Product.id)
        .filter(Product.user_id == user_id)
        .order_by(Product.name.asc())
        .all()
    )


def get_latest_recommendations(db: Session, user_id: int):
    recommendation_rows = (
        db.query(Recommendation, Product.name)
        .join(Product, Product.id == Recommendation.product_id)
        .filter(
            Recommendation.user_id == user_id,
            Product.user_id == user_id,
        )
        .order_by(
            Recommendation.recommended_quantity.desc(),
            Product.name.asc(),
            Recommendation.id.desc(),
        )
        .all()
    )

    latest_by_product_id = {}

    for recommendation, product_name in recommendation_rows:
        if recommendation.product_id not in latest_by_product_id:
            latest_by_product_id[recommendation.product_id] = (
                recommendation,
                product_name,
            )

    return list(latest_by_product_id.values())


def build_operations_summary(db: Session, user_id: int) -> AssistantResponse:
    product_rows = get_user_products_with_inventory(db, user_id)

    product_count = len(product_rows)
    order_count = (
        db.query(Order)
        .filter(Order.user_id == user_id)
        .count()
    )
    forecast_count = (
        db.query(Forecast)
        .filter(Forecast.user_id == user_id)
        .count()
    )

    low_stock_products = []

    for product, inventory in product_rows:
        if not inventory:
            continue

        if inventory.current_stock <= product.reorder_threshold:
            low_stock_products.append(
                f"{product.name} ({format_quantity(inventory.current_stock)} in stock, threshold {format_quantity(product.reorder_threshold)})"
            )

    latest_recommendations = get_latest_recommendations(db, user_id)
    restock_recommendations = [
        f"{product_name}: {format_quantity(recommendation.recommended_quantity)} units"
        for recommendation, product_name in latest_recommendations
        if recommendation.recommended_quantity > 0
    ]

    low_stock_count = len(low_stock_products)

    highlights = [
        f"{product_count} products tracked",
        f"{order_count} orders processed",
        f"{forecast_count} forecasts available",
        f"{low_stock_count} low-stock products",
    ]

    if restock_recommendations:
        highlights.append(f"Top restock recommendation: {restock_recommendations[0]}")
    else:
        highlights.append("No active restock recommendations")

    suggested_actions = []

    if product_count == 0:
        suggested_actions.append("Add your first product.")
    elif order_count == 0:
        suggested_actions.append("Create orders to build demand history.")
    elif forecast_count == 0:
        suggested_actions.append("Generate forecasts from your order history.")
    elif not latest_recommendations:
        suggested_actions.append("Generate recommendations from forecasts and inventory.")
    else:
        suggested_actions.append("Review low-stock products and restock recommendations.")

    return AssistantResponse(
        answer="Here is your current operations summary.",
        highlights=highlights,
        suggested_actions=suggested_actions,
    )


def answer_low_stock_question(db: Session, user_id: int) -> AssistantResponse:
    product_rows = get_user_products_with_inventory(db, user_id)

    low_stock_products = []

    for product, inventory in product_rows:
        if not inventory:
            continue

        if inventory.current_stock <= product.reorder_threshold:
            low_stock_products.append(
                f"{product.name}: {format_quantity(inventory.current_stock)} in stock, threshold {format_quantity(product.reorder_threshold)}"
            )

    if not low_stock_products:
        return AssistantResponse(
            answer="No products are currently below their reorder threshold.",
            highlights=[],
            suggested_actions=["Keep monitoring inventory as new orders come in."],
        )

    return AssistantResponse(
        answer=f"{len(low_stock_products)} products are currently low stock.",
        highlights=low_stock_products,
        suggested_actions=["Review these products and consider restocking soon."],
    )


def answer_restock_question(db: Session, user_id: int) -> AssistantResponse:
    latest_recommendations = get_latest_recommendations(db, user_id)

    restock_recommendations = [
        f"{product_name}: restock {format_quantity(recommendation.recommended_quantity)} units"
        for recommendation, product_name in latest_recommendations
        if recommendation.recommended_quantity > 0
    ]

    if not latest_recommendations:
        return AssistantResponse(
            answer="No recommendations are available yet.",
            highlights=[],
            suggested_actions=["Generate forecasts.", "Generate recommendations."],
        )

    if not restock_recommendations:
        return AssistantResponse(
            answer="No products currently need restocking based on the latest recommendations.",
            highlights=[],
            suggested_actions=["Review inventory again after more orders are created."],
        )

    return AssistantResponse(
        answer=f"{len(restock_recommendations)} products have restock recommendations.",
        highlights=restock_recommendations,
        suggested_actions=["Restock the highest-priority products first."],
    )


def answer_forecast_question(db: Session, user_id: int) -> AssistantResponse:
    latest_forecast = (
        db.query(Forecast, Product.name)
        .join(Product, Product.id == Forecast.product_id)
        .filter(
            Forecast.user_id == user_id,
            Product.user_id == user_id,
        )
        .order_by(Forecast.predicted_demand.desc(), Product.name.asc())
        .first()
    )

    if not latest_forecast:
        return AssistantResponse(
            answer="No forecasts are available yet.",
            highlights=[],
            suggested_actions=["Create orders.", "Generate forecasts."],
        )

    forecast, product_name = latest_forecast

    return AssistantResponse(
        answer=f"{product_name} currently has the highest predicted demand.",
        highlights=[
            f"{product_name}: {format_quantity(forecast.predicted_demand)} units forecasted"
        ],
        suggested_actions=["Review this product's inventory and recommendation."],
    )


@router.get("/summary", response_model=AssistantResponse)
def get_assistant_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return build_operations_summary(db, current_user.id)


@router.post("/ask", response_model=AssistantResponse)
def ask_assistant(
    question: AssistantQuestion,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    normalized_question = question.question.lower().strip()

    if any(keyword in normalized_question for keyword in ["low stock", "low-stock", "threshold"]):
        return answer_low_stock_question(db, current_user.id)

    if any(keyword in normalized_question for keyword in ["restock", "reorder", "recommend"]):
        return answer_restock_question(db, current_user.id)

    if any(keyword in normalized_question for keyword in ["forecast", "demand", "predicted"]):
        return answer_forecast_question(db, current_user.id)

    if any(keyword in normalized_question for keyword in ["summary", "status", "overview", "operations"]):
        return build_operations_summary(db, current_user.id)

    return AssistantResponse(
        answer=(
            "I can help summarize operations, identify low-stock products, "
            "review restock recommendations, and explain forecasted demand."
        ),
        highlights=[
            "Inventory health",
            "Restock recommendations",
            "Forecasted demand",
        ],
        suggested_actions=[
            "Ask: Which products are low stock?",
            "Ask: What should I restock?",
            "Ask: Which product has the highest forecasted demand?",
        ],
    )