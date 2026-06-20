from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth.security import get_current_user
from app.database import get_db
from app.models.inventories import Inventory
from app.models.product import Product
from app.models.user import User
from app.schemas.inventory import InventoryResponse, InventoryUpdate

router = APIRouter(prefix="/inventory", tags=["inventory"])


def get_owned_product_or_404(
    product_id: int,
    db: Session,
    current_user: User,
):
    product = (
        db.query(Product)
        .filter(
            Product.id == product_id,
            Product.user_id == current_user.id,
        )
        .first()
    )

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    return product


@router.get("/{product_id}", response_model=InventoryResponse)
def get_inventory(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    get_owned_product_or_404(product_id, db, current_user)

    inventory = (
        db.query(Inventory)
        .filter(Inventory.product_id == product_id)
        .first()
    )

    if not inventory:
        raise HTTPException(status_code=404, detail="Inventory not found")

    return inventory


@router.patch("/{product_id}", response_model=InventoryResponse)
def update_inventory(
    product_id: int,
    inventory_update: InventoryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    get_owned_product_or_404(product_id, db, current_user)

    inventory = (
        db.query(Inventory)
        .filter(Inventory.product_id == product_id)
        .first()
    )

    if not inventory:
        raise HTTPException(status_code=404, detail="Inventory not found")

    inventory.current_stock = inventory_update.current_stock
    db.commit()
    db.refresh(inventory)

    return inventory