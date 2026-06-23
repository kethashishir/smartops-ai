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
from decimal import Decimal

from app.services.forecast_service import (
    MODEL_VERSION,
    calculate_demand_volatility_score,
    get_volatility_level,
)
from app.services.risk_service import calculate_demand_risk_score, get_risk_level

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

def get_latest_forecast_for_product(
    db: Session,
    user_id: int,
    product_id: int,
):
    return (
        db.query(Forecast)
        .filter(
            Forecast.user_id == user_id,
            Forecast.product_id == product_id,
            Forecast.model_version == MODEL_VERSION,
        )
        .order_by(Forecast.forecast_date.desc(), Forecast.id.desc())
        .first()
    )


def get_order_quantities_for_product(
    db: Session,
    user_id: int,
    product_id: int,
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


def get_recommendation_risk_rows(db: Session, user_id: int):
    latest_recommendations = get_latest_recommendations(db, user_id)
    risk_rows = []

    for recommendation, product_name in latest_recommendations:
        product = (
            db.query(Product)
            .filter(
                Product.id == recommendation.product_id,
                Product.user_id == user_id,
            )
            .first()
        )

        inventory = (
            db.query(Inventory)
            .filter(Inventory.product_id == recommendation.product_id)
            .first()
        )

        forecast = get_latest_forecast_for_product(
            db,
            user_id,
            recommendation.product_id,
        )

        if not product or not inventory or not forecast:
            continue

        risk_score = calculate_demand_risk_score(
            current_stock=inventory.current_stock,
            reorder_threshold=product.reorder_threshold,
            predicted_demand=Decimal(forecast.predicted_demand),
            recommended_quantity=Decimal(recommendation.recommended_quantity),
        )
        risk_level = get_risk_level(risk_score)

        risk_rows.append(
            {
                "product_name": product_name,
                "recommended_quantity": recommendation.recommended_quantity,
                "current_stock": inventory.current_stock,
                "reorder_threshold": product.reorder_threshold,
                "predicted_demand": forecast.predicted_demand,
                "risk_score": risk_score,
                "risk_level": risk_level,
            }
        )

    return sorted(
        risk_rows,
        key=lambda row: (
            -row["risk_score"],
            row["product_name"].lower(),
        ),
    )


def get_forecast_volatility_rows(db: Session, user_id: int):
    forecast_rows = (
        db.query(Forecast, Product)
        .join(Product, Product.id == Forecast.product_id)
        .filter(
            Forecast.user_id == user_id,
            Product.user_id == user_id,
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
        if product.id not in latest_by_product_id:
            latest_by_product_id[product.id] = (forecast, product)

    volatility_rows = []

    for forecast, product in latest_by_product_id.values():
        order_quantities = get_order_quantities_for_product(
            db,
            user_id,
            product.id,
        )
        volatility_score = calculate_demand_volatility_score(order_quantities)
        volatility_level = get_volatility_level(
            volatility_score,
            len(order_quantities),
        )

        volatility_rows.append(
            {
                "product_name": product.name,
                "predicted_demand": forecast.predicted_demand,
                "volatility_score": volatility_score,
                "volatility_level": volatility_level,
                "order_count": len(order_quantities),
            }
        )

    return sorted(
        volatility_rows,
        key=lambda row: (
            -row["volatility_score"],
            row["product_name"].lower(),
        ),
    )

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

def answer_healthy_inventory_question(db: Session, user_id: int) -> AssistantResponse:
    product_rows = get_user_products_with_inventory(db, user_id)

    healthy_products = []

    for product, inventory in product_rows:
        if not inventory:
            continue

        if inventory.current_stock > product.reorder_threshold:
            healthy_products.append(
                f"{product.name}: {format_quantity(inventory.current_stock)} in stock, threshold {format_quantity(product.reorder_threshold)}"
            )

    if not healthy_products:
        return AssistantResponse(
            answer="No products are currently above their reorder threshold.",
            highlights=[],
            suggested_actions=["Review low-stock products and restock recommendations."],
        )

    return AssistantResponse(
        answer=f"{len(healthy_products)} products are currently above their reorder threshold.",
        highlights=healthy_products,
        suggested_actions=["Keep monitoring these products as new orders come in."],
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

def answer_demand_risk_question(db: Session, user_id: int) -> AssistantResponse:
    risk_rows = get_recommendation_risk_rows(db, user_id)

    if not risk_rows:
        return AssistantResponse(
            answer="No demand risk scores are available yet.",
            highlights=[],
            suggested_actions=[
                "Generate forecasts.",
                "Generate recommendations.",
                "Refresh recommendations to calculate risk scores.",
            ],
        )

    high_priority_rows = [
        row
        for row in risk_rows
        if row["risk_level"] in ("critical", "high")
    ]

    if not high_priority_rows:
        return AssistantResponse(
            answer="No products are currently classified as high or critical demand risk.",
            highlights=[
                f"{row['product_name']}: {row['risk_level']} risk, score {row['risk_score']}"
                for row in risk_rows[:5]
            ],
            suggested_actions=[
                "Continue monitoring low-stock products and demand changes.",
            ],
        )

    return AssistantResponse(
        answer=f"{len(high_priority_rows)} products are currently high or critical demand risk.",
        highlights=[
            (
                f"{row['product_name']}: {row['risk_level']} risk, "
                f"score {row['risk_score']}, "
                f"stock {format_quantity(row['current_stock'])}, "
                f"forecast {format_quantity(row['predicted_demand'])}, "
                f"recommended reorder {format_quantity(row['recommended_quantity'])}"
            )
            for row in high_priority_rows[:8]
        ],
        suggested_actions=[
            "Prioritize critical-risk products first.",
            "Review high-risk products with low stock and strong forecasted demand.",
            "Refresh forecasts and recommendations after new orders.",
        ],
    )


def answer_demand_risk_explanation() -> AssistantResponse:
    return AssistantResponse(
        answer=(
            "Demand risk measures how urgent a restock decision is. "
            "SmartOps AI scores risk using stock pressure, forecasted demand, "
            "reorder threshold, and recommended reorder quantity."
        ),
        highlights=[
            "Critical risk: severe stock pressure and strong forecasted demand",
            "High risk: product likely needs restock attention soon",
            "Medium risk: some warning signs exist",
            "Low risk: current stock and demand look manageable",
        ],
        suggested_actions=[
            "Use critical and high risk labels to prioritize restocking.",
            "Review risk scores together with forecast and recommendation details.",
        ],
    )


def answer_volatility_question(db: Session, user_id: int) -> AssistantResponse:
    volatility_rows = get_forecast_volatility_rows(db, user_id)

    if not volatility_rows:
        return AssistantResponse(
            answer="No demand volatility data is available yet.",
            highlights=[],
            suggested_actions=[
                "Create orders.",
                "Generate forecasts.",
                "Review volatility after more order history exists.",
            ],
        )

    high_volatility_rows = [
        row
        for row in volatility_rows
        if row["volatility_level"] == "high"
    ]

    if not high_volatility_rows:
        return AssistantResponse(
            answer="No products currently show high demand volatility.",
            highlights=[
                (
                    f"{row['product_name']}: {row['volatility_level']} volatility, "
                    f"score {row['volatility_score']}, "
                    f"{row['order_count']} order(s)"
                )
                for row in volatility_rows[:6]
            ],
            suggested_actions=[
                "Continue monitoring products as more orders are created.",
            ],
        )

    return AssistantResponse(
        answer=f"{len(high_volatility_rows)} products show high demand volatility.",
        highlights=[
            (
                f"{row['product_name']}: high volatility, "
                f"score {row['volatility_score']}, "
                f"{row['order_count']} order(s), "
                f"forecast {format_quantity(row['predicted_demand'])}"
            )
            for row in high_volatility_rows[:8]
        ],
        suggested_actions=[
            "Review volatile products before placing large purchase orders.",
            "Use more order history before trusting aggressive reorder decisions.",
        ],
    )

def answer_volatility_explanation() -> AssistantResponse:
    return AssistantResponse(
        answer=(
            "Demand volatility measures how much order quantities vary over time. "
            "Stable demand has similar order sizes. High volatility means order sizes "
            "change sharply, so forecasts and restock decisions should be reviewed more carefully."
        ),
        highlights=[
            "Stable: order quantities are consistent",
            "Moderate: some demand variation exists",
            "High: order quantities vary significantly",
            "Limited history: not enough order data to judge demand stability",
        ],
        suggested_actions=[
            "Use volatility labels to decide how much confidence to place in a forecast.",
            "Collect more order history for limited-history products.",
        ],
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

def answer_forecast_freshness_question(db: Session, user_id: int) -> AssistantResponse:
    latest_order = (
        db.query(Order)
        .filter(Order.user_id == user_id)
        .order_by(Order.order_time.desc(), Order.id.desc())
        .first()
    )

    latest_forecast = (
        db.query(Forecast)
        .filter(Forecast.user_id == user_id)
        .order_by(Forecast.forecast_date.desc(), Forecast.id.desc())
        .first()
    )

    if not latest_order and not latest_forecast:
        return AssistantResponse(
            answer="Forecasts are not available yet because there is no order history.",
            highlights=[
                "No orders found",
                "No forecasts found",
            ],
            suggested_actions=["Create orders first, then generate forecasts."],
        )

    if latest_order and not latest_forecast:
        return AssistantResponse(
            answer="You should generate forecasts.",
            highlights=[
                "Orders exist",
                "No forecasts are available yet",
            ],
            suggested_actions=["Generate forecasts from your order history."],
        )

    if latest_order and latest_forecast:
        latest_order_date = latest_order.order_time.date()

        if latest_order_date > latest_forecast.forecast_date:
            return AssistantResponse(
                answer="You should regenerate forecasts because newer order activity exists.",
                highlights=[
                    f"Latest order date: {latest_order_date.isoformat()}",
                    f"Latest forecast date: {latest_forecast.forecast_date.isoformat()}",
                ],
                suggested_actions=[
                    "Generate updated forecasts.",
                    "Then refresh recommendations.",
                ],
            )

    return AssistantResponse(
        answer="Your forecasts appear to be up to date with current order activity.",
        highlights=[
            f"Latest forecast date: {latest_forecast.forecast_date.isoformat()}",
        ],
        suggested_actions=["Review recommendations or continue monitoring orders."],
    )

def answer_recent_activity_question(db: Session, user_id: int) -> AssistantResponse:
    recent_orders = (
        db.query(Order, Product.name)
        .join(Product, Product.id == Order.product_id)
        .filter(
            Order.user_id == user_id,
            Product.user_id == user_id,
        )
        .order_by(Order.order_time.desc(), Order.id.desc())
        .limit(5)
        .all()
    )

    if not recent_orders:
        return AssistantResponse(
            answer="No recent order activity is available yet.",
            highlights=[],
            suggested_actions=["Create orders to start building activity history."],
        )

    highlights = [
        f"{product_name}: {format_quantity(order.quantity)} units ordered"
        for order, product_name in recent_orders
    ]

    return AssistantResponse(
        answer=f"Here are your latest {len(recent_orders)} order activities.",
        highlights=highlights,
        suggested_actions=[
            "Review recent orders before generating updated forecasts.",
        ],
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
    
    if any(
        keyword in normalized_question
        for keyword in [
            "explain risk",
            "what is risk",
            "risk score mean",
            "risk scoring",
            "demand risk mean",
        ]
    ):
        return answer_demand_risk_explanation()

    if any(
        keyword in normalized_question
        for keyword in [
            "critical risk",
            "high risk",
            "demand risk",
            "riskiest",
            "risky",
            "risk products",
        ]
    ):
        return answer_demand_risk_question(db, current_user.id)

    if any(
        keyword in normalized_question
        for keyword in [
            "explain volatility",
            "what is volatility",
            "volatility mean",
            "volatility score",
        ]
    ):
        return answer_volatility_explanation()

    if any(
        keyword in normalized_question
        for keyword in [
            "high volatility",
            "demand volatility",
            "volatile",
            "unstable demand",
            "stable demand",
        ]
    ):
        return answer_volatility_question(db, current_user.id)
    
    if any(
        keyword in normalized_question
        for keyword in [
            "recent",
            "activity",
            "changed",
            "change",
            "happened",
            "latest order",
            "recent order",
        ]
    ):
        return answer_recent_activity_question(db, current_user.id)

    if any(keyword in normalized_question for keyword in ["low stock", "low-stock", "threshold"]):
        return answer_low_stock_question(db, current_user.id)
    
    if any(
        keyword in normalized_question
        for keyword in ["healthy", "safe", "okay", "ok", "above threshold"]
    ):
        return answer_healthy_inventory_question(db, current_user.id)

    if any(keyword in normalized_question for keyword in ["restock", "reorder", "recommend"]):
        return answer_restock_question(db, current_user.id)
    
    if any(
        keyword in normalized_question
        for keyword in [
            "generate forecast",
            "generate forecasts",
            "regenerate forecast",
            "regenerate forecasts",
            "refresh forecast",
            "refresh forecasts",
            "forecasts up to date",
            "forecast up to date",
            "demand planning",
        ]
    ):
        return answer_forecast_freshness_question(db, current_user.id)

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