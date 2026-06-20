from decimal import Decimal

from app.services.forecast_service import calculate_predicted_demand


def test_calculate_predicted_demand_uses_larger_of_orders_and_threshold():
    result = calculate_predicted_demand(
        Decimal("20"),
        Decimal("10"),
    )

    assert result == Decimal("23.00")


def test_calculate_predicted_demand_uses_threshold_when_orders_are_lower():
    result = calculate_predicted_demand(
        Decimal("5"),
        Decimal("10"),
    )

    assert result == Decimal("11.50")