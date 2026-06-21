from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth.security import get_current_user
from app.database import get_db
from app.models.inventories import Inventory
from app.models.orders import Order
from app.models.product import Product
from app.models.user import User
from app.schemas.orders import OrderCreate, OrderResponse

router = APIRouter(prefix="/orders", tags=["orders"])


def build_order_response(order: Order, product_name: str) -> dict:
    return {
        "id": order.id,
        "user_id": order.user_id,
        "product_id": order.product_id,
        "product_name": product_name,
        "quantity": order.quantity,
        "order_time": order.order_time,
        "source": order.source,
    }


@router.post("/", response_model=OrderResponse)
def create_order(
    order: OrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    product = (
        db.query(Product)
        .filter(
            Product.id == order.product_id,
            Product.user_id == current_user.id,
        )
        .first()
    )

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    db_inventory = (
        db.query(Inventory)
        .filter(Inventory.product_id == order.product_id)
        .first()
    )

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
        user_id=current_user.id,
        product_id=order.product_id,
        quantity=order.quantity,
        source=order.source,
    )
    db.add(db_order)
    db.commit()
    db.refresh(db_order)

    return build_order_response(db_order, product.name)


@router.get("/", response_model=list[OrderResponse])
def get_orders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    order_rows = (
        db.query(Order, Product.name)
        .join(Product, Product.id == Order.product_id)
        .filter(
            Order.user_id == current_user.id,
            Product.user_id == current_user.id,
        )
        .order_by(Order.order_time.desc())
        .all()
    )

    return [
        build_order_response(order, product_name)
        for order, product_name in order_rows
    ]