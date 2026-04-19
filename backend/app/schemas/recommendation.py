from datetime import datetime
from pydantic import BaseModel

class RecommendationResponse(BaseModel):
    id: int
    product_id: int
    recommended_quantity: float
    reason: str
    created_at: datetime

    class Config:
        orm_mode = True

