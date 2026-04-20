from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.inventories import Inventory
from app.schemas.inventory import InventoryUpdate, InventoryResponse

router = APIRouter(prefix="/inventory", tags=["inventory"])

@router.get("/{product_id}", response_model=InventoryResponse)
def get_inventory(product_id: int, db: Session = Depends(get_db)):
    
    inventory = db.query(Inventory).filter(Inventory.product_id == product_id).first()
    if not inventory:
        raise HTTPException(status_code=404, detail="Inventory not found")
    return inventory

@router.patch("/{product_id}", response_model=InventoryResponse)
def update_inventory(product_id: int, inventory_update: InventoryUpdate, db: Session = Depends(get_db)):
    inventory = db.query(Inventory).filter(Inventory.product_id == product_id).first()
    if not inventory:
        raise HTTPException(status_code=404, detail="Inventory not found")
    
    inventory.current_stock = inventory_update.current_stock
    db.commit()
    db.refresh(inventory)
    return inventory