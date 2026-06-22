from decimal import Decimal


def calculate_demand_risk_score(
    current_stock: int,
    reorder_threshold: int,
    predicted_demand: Decimal,
    recommended_quantity: Decimal,
) -> int:
    score = 0

    if reorder_threshold <= 0:
        stock_pressure = Decimal("0")
    else:
        stock_pressure = Decimal(current_stock) / Decimal(reorder_threshold)

    if current_stock <= 0:
        score += 40
    elif stock_pressure <= Decimal("0.50"):
        score += 30
    elif stock_pressure <= Decimal("1.00"):
        score += 20

    if predicted_demand > current_stock:
        score += 30

    if recommended_quantity > 0:
        score += 20

    if predicted_demand >= Decimal(reorder_threshold) * Decimal("1.50"):
        score += 10

    return min(score, 100)


def get_risk_level(risk_score: int) -> str:
    if risk_score >= 80:
        return "critical"

    if risk_score >= 60:
        return "high"

    if risk_score >= 30:
        return "medium"

    return "low"