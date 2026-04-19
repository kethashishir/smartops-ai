from datetime import datetime
from pydantic import BaseModel

class RecommendationResponse(BaseModel):
    id: int
    product_id: int
    recommended_quantity: float
    reason: str
    created_at: datetime
    model_config = {"from_attributes": True}

