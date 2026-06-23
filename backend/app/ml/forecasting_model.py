from __future__ import annotations

import json
from dataclasses import dataclass
from decimal import Decimal
from pathlib import Path


MODEL_ARTIFACT_PATH = Path(__file__).resolve().parent / "forecast_model.json"
ML_MODEL_VERSION = "ml-regression-v1"


@dataclass
class ForecastFeatureRow:
    reorder_threshold: Decimal
    total_order_quantity: Decimal
    order_count: int
    average_order_quantity: Decimal
    recent_order_quantity: Decimal
    volatility_score: int
    trend_multiplier: Decimal
    target_demand: Decimal


DEFAULT_WEIGHTS = {
    "bias": Decimal("0.00"),
    "reorder_threshold": Decimal("0.35"),
    "total_order_quantity": Decimal("0.25"),
    "order_count": Decimal("0.75"),
    "average_order_quantity": Decimal("1.10"),
    "recent_order_quantity": Decimal("0.80"),
    "volatility_score": Decimal("0.05"),
    "trend_multiplier": Decimal("4.00"),
}


def decimal_to_float(value: Decimal) -> float:
    return float(value)


def calculate_average(values: list[Decimal]) -> Decimal:
    if not values:
        return Decimal("0")

    return sum(values, Decimal("0")) / Decimal(len(values))


def build_feature_row(
    reorder_threshold: Decimal,
    order_quantities: list[int],
    volatility_score: int,
    trend_multiplier: Decimal,
) -> ForecastFeatureRow:
    decimal_quantities = [Decimal(quantity) for quantity in order_quantities]
    total_order_quantity = sum(decimal_quantities, Decimal("0"))
    order_count = len(decimal_quantities)
    average_order_quantity = calculate_average(decimal_quantities)
    recent_order_quantity = decimal_quantities[-1] if decimal_quantities else Decimal("0")

    if order_count >= 2:
        target_demand = max(
            reorder_threshold,
            total_order_quantity,
            average_order_quantity * Decimal("3"),
            recent_order_quantity * Decimal("2"),
        )
    else:
        target_demand = max(reorder_threshold, total_order_quantity)

    return ForecastFeatureRow(
        reorder_threshold=reorder_threshold,
        total_order_quantity=total_order_quantity,
        order_count=order_count,
        average_order_quantity=average_order_quantity,
        recent_order_quantity=recent_order_quantity,
        volatility_score=volatility_score,
        trend_multiplier=trend_multiplier,
        target_demand=target_demand,
    )


def predict_with_weights(
    row: ForecastFeatureRow,
    weights: dict[str, Decimal],
) -> Decimal:
    prediction = (
        weights["bias"]
        + row.reorder_threshold * weights["reorder_threshold"]
        + row.total_order_quantity * weights["total_order_quantity"]
        + Decimal(row.order_count) * weights["order_count"]
        + row.average_order_quantity * weights["average_order_quantity"]
        + row.recent_order_quantity * weights["recent_order_quantity"]
        + Decimal(row.volatility_score) * weights["volatility_score"]
        + row.trend_multiplier * weights["trend_multiplier"]
    )

    return max(prediction, row.reorder_threshold, Decimal("0")).quantize(Decimal("0.01"))


def evaluate_model(
    rows: list[ForecastFeatureRow],
    weights: dict[str, Decimal],
) -> dict:
    if not rows:
        return {
            "training_rows": 0,
            "mean_absolute_error": 0.0,
        }

    absolute_errors = [
        abs(predict_with_weights(row, weights) - row.target_demand)
        for row in rows
    ]

    mean_absolute_error = sum(absolute_errors, Decimal("0")) / Decimal(len(rows))

    return {
        "training_rows": len(rows),
        "mean_absolute_error": decimal_to_float(mean_absolute_error.quantize(Decimal("0.01"))),
    }


def save_model_artifact(
    rows: list[ForecastFeatureRow],
    weights: dict[str, Decimal] | None = None,
    artifact_path: Path = MODEL_ARTIFACT_PATH,
) -> dict:
    active_weights = weights or DEFAULT_WEIGHTS
    metrics = evaluate_model(rows, active_weights)

    artifact = {
        "model_version": ML_MODEL_VERSION,
        "model_type": "explainable_weighted_regression",
        "features": list(DEFAULT_WEIGHTS.keys()),
        "weights": {
            key: decimal_to_float(value)
            for key, value in active_weights.items()
        },
        "metrics": metrics,
    }

    artifact_path.write_text(json.dumps(artifact, indent=2))

    return artifact


def load_model_artifact(
    artifact_path: Path = MODEL_ARTIFACT_PATH,
) -> dict | None:
    if not artifact_path.exists():
        return None

    return json.loads(artifact_path.read_text())


def load_model_weights(
    artifact_path: Path = MODEL_ARTIFACT_PATH,
) -> dict[str, Decimal]:
    artifact = load_model_artifact(artifact_path)

    if not artifact:
        return DEFAULT_WEIGHTS

    return {
        key: Decimal(str(value))
        for key, value in artifact["weights"].items()
    }


def predict_demand_with_ml(
    reorder_threshold: Decimal,
    order_quantities: list[int],
    volatility_score: int,
    trend_multiplier: Decimal,
    artifact_path: Path = MODEL_ARTIFACT_PATH,
) -> Decimal:
    row = build_feature_row(
        reorder_threshold=reorder_threshold,
        order_quantities=order_quantities,
        volatility_score=volatility_score,
        trend_multiplier=trend_multiplier,
    )

    weights = load_model_weights(artifact_path)

    return predict_with_weights(row, weights)
