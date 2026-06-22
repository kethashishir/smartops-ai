from decimal import Decimal

from app.services.forecast_service import (
    calculate_predicted_demand,
    calculate_trend_multiplier,
    build_forecast_explanation,
    calculate_demand_volatility_score,
    get_volatility_level,
)


def test_calculate_trend_multiplier_for_no_orders():
    assert calculate_trend_multiplier(0) == Decimal("1.00")


def test_calculate_trend_multiplier_for_light_activity():
    assert calculate_trend_multiplier(1) == Decimal("1.10")


def test_calculate_trend_multiplier_for_medium_activity():
    assert calculate_trend_multiplier(4) == Decimal("1.20")


def test_calculate_trend_multiplier_for_high_activity():
    assert calculate_trend_multiplier(8) == Decimal("1.30")


def test_calculate_predicted_demand_uses_threshold_when_no_orders():
    result = calculate_predicted_demand(
        Decimal("0"),
        Decimal("10"),
        0,
    )

    assert result == Decimal("10.00")


def test_calculate_predicted_demand_applies_light_order_trend():
    result = calculate_predicted_demand(
        Decimal("20"),
        Decimal("10"),
        1,
    )

    assert result == Decimal("22.00")


def test_calculate_predicted_demand_applies_medium_order_trend():
    result = calculate_predicted_demand(
        Decimal("20"),
        Decimal("10"),
        4,
    )

    assert result == Decimal("24.00")


def test_calculate_predicted_demand_applies_high_order_trend():
    result = calculate_predicted_demand(
        Decimal("20"),
        Decimal("10"),
        8,
    )

    assert result == Decimal("26.00")


def test_calculate_predicted_demand_uses_average_order_signal():
    result = calculate_predicted_demand(
        Decimal("12"),
        Decimal("10"),
        2,
    )

    assert result == Decimal("19.80")

def test_build_forecast_explanation_describes_model_inputs():
    explanation = build_forecast_explanation(
        Decimal("20"),
        Decimal("10"),
        4,
        Decimal("24.00"),
    )

    assert "20 total ordered units" in explanation
    assert "4 order(s)" in explanation
    assert "medium order activity" in explanation
    assert "Final predicted demand is 24.00" in explanation

def test_calculate_demand_volatility_score_requires_multiple_orders():
    assert calculate_demand_volatility_score([10]) == 0


def test_calculate_demand_volatility_score_detects_stable_demand():
    assert calculate_demand_volatility_score([10, 10, 10]) == 0


def test_calculate_demand_volatility_score_detects_high_variation():
    assert calculate_demand_volatility_score([1, 10, 19]) == 60


def test_get_volatility_level_for_insufficient_history():
    assert get_volatility_level(0, 1) == "insufficient history"


def test_get_volatility_level_for_stable_demand():
    assert get_volatility_level(0, 3) == "stable"


def test_get_volatility_level_for_moderate_demand():
    assert get_volatility_level(25, 3) == "moderate"


def test_get_volatility_level_for_high_demand():
    assert get_volatility_level(60, 3) == "high"