from datetime import datetime

from pydantic import BaseModel


class RecommendationResponse(BaseModel):
    id: int
    user_id: int
    product_id: int
    product_name: str
    recommended_quantity: int
    reason: str
    created_at: datetime


class RecommendationCreate(BaseModel):
    product_id: int
    recommended_quantity: int
    reason: str