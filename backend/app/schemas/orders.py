from datetime import datetime

from pydantic import BaseModel


class OrderCreate(BaseModel):
    product_id: int
    quantity: int
    source: str


class OrderResponse(BaseModel):
    id: int
    user_id: int
    product_id: int
    product_name: str
    quantity: int
    order_time: datetime
    source: str