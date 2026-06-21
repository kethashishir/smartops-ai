from datetime import date

from pydantic import BaseModel


class ForecastResponse(BaseModel):
    id: int
    user_id: int
    product_id: int
    product_name: str
    forecast_date: date
    predicted_demand: float
    model_version: str


class ForecastCreate(BaseModel):
    product_id: int
    forecast_date: date
    predicted_demand: float
    model_version: str