from datetime import datetime
from pydantic import BaseModel

class ProductCreate(BaseModel):
    sku: str
    name: str
    category: str
    reorder_threshold: int
    unit_price: float

class ProductResponse(BaseModel):
    id: int
    sku: str
    name: str
    category: str
    reorder_threshold: int
    unit_price: float
    created_at: datetime
    class Config:
        orm_mode = True