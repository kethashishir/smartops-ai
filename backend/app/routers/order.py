from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth.security import get_current_user
from app.database import get_db
from app.models.inventories import Inventory
from app.models.orders import Order
from app.models.product import Product
from app.schemas.orders import OrderCreate, OrderResponse

router = APIRouter(
    prefix="/orders",
    tags=["orders"],
    dependencies=[Depends(get_current_user)],
)


@router.post("/", response_model=OrderResponse)
def create_order(order: OrderCreate, db: Session = Depends(get_db)):
    db_inventory = (
        db.query(Inventory)
        .filter(Inventory.product_id == order.product_id)
        .first()
    )

    if not db.query(Product).filter(Product.id == order.product_id).first():
        raise HTTPException(status_code=404, detail="Product not found")

    if not db_inventory:
        raise HTTPException(
            status_code=404,
            detail="Inventory record not found for the product",
        )

    if db_inventory.current_stock < order.quantity:
        raise HTTPException(status_code=400, detail="Not enough stock")

    db_inventory.current_stock -= order.quantity
    db.commit()
    db.refresh(db_inventory)

    db_order = Order(
        product_id=order.product_id,
        quantity=order.quantity,
        source=order.source,
    )
    db.add(db_order)
    db.commit()
    db.refresh(db_order)

    return db_order


@router.get("/", response_model=list[OrderResponse])
def get_orders(db: Session = Depends(get_db)):
    orders = db.query(Order).all()
    return orders