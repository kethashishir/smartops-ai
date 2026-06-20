from datetime import datetime

from pydantic import BaseModel


class RecommendationResponse(BaseModel):
    id: int
    user_id: int
    product_id: int
    recommended_quantity: int
    reason: str
    created_at: datetime

    model_config = {"from_attributes": True}


class RecommendationCreate(BaseModel):
    product_id: int
    recommended_quantity: int
    reason: str