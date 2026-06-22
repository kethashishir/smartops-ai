from decimal import Decimal

from app.services.risk_service import calculate_demand_risk_score, get_risk_level


def test_get_risk_level_low():
    assert get_risk_level(10) == "low"


def test_get_risk_level_medium():
    assert get_risk_level(30) == "medium"


def test_get_risk_level_high():
    assert get_risk_level(60) == "high"


def test_get_risk_level_critical():
    assert get_risk_level(80) == "critical"


def test_calculate_demand_risk_score_for_healthy_inventory():
    score = calculate_demand_risk_score(
        current_stock=100,
        reorder_threshold=20,
        predicted_demand=Decimal("10"),
        recommended_quantity=Decimal("0"),
    )

    assert score == 0


def test_calculate_demand_risk_score_for_critical_inventory():
    score = calculate_demand_risk_score(
        current_stock=0,
        reorder_threshold=20,
        predicted_demand=Decimal("45"),
        recommended_quantity=Decimal("45"),
    )

    assert score == 100