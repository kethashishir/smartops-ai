from decimal import Decimal
from pathlib import Path

from app.ml.forecasting_model import (
    ML_MODEL_VERSION,
    build_feature_row,
    evaluate_model,
    load_model_artifact,
    predict_demand_with_ml,
    predict_with_weights,
    save_model_artifact,
)


def test_build_feature_row_creates_training_features():
    row = build_feature_row(
        reorder_threshold=Decimal("10"),
        order_quantities=[4, 8, 12],
        volatility_score=30,
        trend_multiplier=Decimal("1.20"),
    )

    assert row.reorder_threshold == Decimal("10")
    assert row.total_order_quantity == Decimal("24")
    assert row.order_count == 3
    assert row.average_order_quantity == Decimal("8")
    assert row.recent_order_quantity == Decimal("12")
    assert row.volatility_score == 30
    assert row.trend_multiplier == Decimal("1.20")
    assert row.target_demand >= Decimal("24")


def test_predict_with_weights_returns_positive_forecast():
    row = build_feature_row(
        reorder_threshold=Decimal("10"),
        order_quantities=[4, 8, 12],
        volatility_score=30,
        trend_multiplier=Decimal("1.20"),
    )

    prediction = predict_with_weights(
        row,
        {
            "bias": Decimal("0"),
            "reorder_threshold": Decimal("0.35"),
            "total_order_quantity": Decimal("0.25"),
            "order_count": Decimal("0.75"),
            "average_order_quantity": Decimal("1.10"),
            "recent_order_quantity": Decimal("0.80"),
            "volatility_score": Decimal("0.05"),
            "trend_multiplier": Decimal("4.00"),
        },
    )

    assert prediction >= Decimal("10.00")


def test_evaluate_model_returns_metrics():
    rows = [
        build_feature_row(
            reorder_threshold=Decimal("10"),
            order_quantities=[4, 8, 12],
            volatility_score=30,
            trend_multiplier=Decimal("1.20"),
        )
    ]

    metrics = evaluate_model(
        rows,
        {
            "bias": Decimal("0"),
            "reorder_threshold": Decimal("0.35"),
            "total_order_quantity": Decimal("0.25"),
            "order_count": Decimal("0.75"),
            "average_order_quantity": Decimal("1.10"),
            "recent_order_quantity": Decimal("0.80"),
            "volatility_score": Decimal("0.05"),
            "trend_multiplier": Decimal("4.00"),
        },
    )

    assert metrics["training_rows"] == 1
    assert "mean_absolute_error" in metrics


def test_save_and_load_model_artifact(tmp_path: Path):
    artifact_path = tmp_path / "forecast_model.json"

    rows = [
        build_feature_row(
            reorder_threshold=Decimal("10"),
            order_quantities=[4, 8, 12],
            volatility_score=30,
            trend_multiplier=Decimal("1.20"),
        )
    ]

    artifact = save_model_artifact(rows, artifact_path=artifact_path)
    loaded_artifact = load_model_artifact(artifact_path)

    assert artifact["model_version"] == ML_MODEL_VERSION
    assert loaded_artifact["model_version"] == ML_MODEL_VERSION
    assert loaded_artifact["metrics"]["training_rows"] == 1


def test_predict_demand_with_ml_uses_saved_artifact(tmp_path: Path):
    artifact_path = tmp_path / "forecast_model.json"

    rows = [
        build_feature_row(
            reorder_threshold=Decimal("10"),
            order_quantities=[4, 8, 12],
            volatility_score=30,
            trend_multiplier=Decimal("1.20"),
        )
    ]

    save_model_artifact(rows, artifact_path=artifact_path)

    prediction = predict_demand_with_ml(
        reorder_threshold=Decimal("10"),
        order_quantities=[4, 8, 12],
        volatility_score=30,
        trend_multiplier=Decimal("1.20"),
        artifact_path=artifact_path,
    )

    assert prediction >= Decimal("10.00")
