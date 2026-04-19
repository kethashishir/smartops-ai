from datetime import datetime
from pydantic import BaseModel

class InventoryResponse(BaseModel):
    id: int
    product_id: int
    current_stock: int
    updated_at: datetime
    model_config = {"from_attributes": True}

class InventoryUpdate(BaseModel):
    current_stock: int