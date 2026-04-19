from datetime import datetime
from pydantic import BaseModel

class OrderCreate(BaseModel):
    product_id: int
    quantity: int
    source: str

class OrderResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    order_time: datetime
    source: str
    model_config = {"from_attributes": True}