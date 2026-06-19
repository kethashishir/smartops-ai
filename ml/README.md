# SmartOps AI ML Pipeline

This folder contains machine learning and forecasting scripts for SmartOps AI.

## Baseline Forecast Generator

Script:

```bash
python ml/generate_forecasts.py
```

The baseline forecast generator reads product and order data from PostgreSQL and writes forecast records into the `forecasts` table.

## Current Model

Model version:

```text
baseline-v1
```

The current baseline model calculates predicted demand using:

```text
baseline = max(total_order_quantity, reorder_threshold)
predicted_demand = baseline * 1.15
```

This provides a simple first forecasting pipeline before adding more advanced machine learning models.

## Data Flow

```text
Products + Orders
→ Baseline Forecast Generator
→ Forecasts Table
→ Recommendations Engine
→ Dashboard
```

## Environment Variables

The script reads the database connection from the root `.env` file:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/smartops
```

## Notes

This is an initial baseline model. Future versions can replace the baseline logic with trained models using historical demand, seasonality, product categories, and order patterns.
