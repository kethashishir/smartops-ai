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
    user_id: int
    sku: str
    name: str
    category: str
    reorder_threshold: int
    unit_price: float
    created_at: datetime

    model_config = {"from_attributes": True}


class ProductUpdate(BaseModel):
    name: str | None = None
    category: str | None = None
    reorder_threshold: int | None = None
    unit_price: float | None = None