from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth.security import get_current_user
from app.database import get_db
from app.models.forecast import Forecast
from app.models.inventories import Inventory
from app.models.orders import Order
from app.models.product import Product
from app.models.recommendation import Recommendation
from app.models.user import User
from app.schemas.product import ProductCreate, ProductResponse, ProductUpdate

router = APIRouter(prefix="/products", tags=["products"])


@router.post("/", response_model=ProductResponse)
def create_product(
    product: ProductCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db_product = Product(
        user_id=current_user.id,
        sku=product.sku,
        name=product.name,
        category=product.category,
        reorder_threshold=product.reorder_threshold,
        unit_price=product.unit_price,
    )
    db.add(db_product)
    db.commit()
    db.refresh(db_product)

    db_inventory = Inventory(
        product_id=db_product.id,
        current_stock=0,
    )
    db.add(db_inventory)
    db.commit()
    db.refresh(db_inventory)

    return db_product


@router.get("/", response_model=list[ProductResponse])
def get_products(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    products = (
        db.query(Product)
        .filter(Product.user_id == current_user.id)
        .all()
    )

    return products


@router.patch("/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: int,
    product: ProductUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db_product = (
        db.query(Product)
        .filter(
            Product.id == product_id,
            Product.user_id == current_user.id,
        )
        .first()
    )

    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")

    if product.name is not None:
        db_product.name = product.name
    if product.category is not None:
        db_product.category = product.category
    if product.reorder_threshold is not None:
        db_product.reorder_threshold = product.reorder_threshold
    if product.unit_price is not None:
        db_product.unit_price = product.unit_price

    db.commit()
    db.refresh(db_product)

    return db_product


@router.delete("/{product_id}")
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db_product = (
        db.query(Product)
        .filter(
            Product.id == product_id,
            Product.user_id == current_user.id,
        )
        .first()
    )

    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")

    order_count = (
        db.query(Order)
        .filter(
            Order.product_id == product_id,
            Order.user_id == current_user.id,
        )
        .count()
    )

    if order_count > 0:
        raise HTTPException(
            status_code=400,
            detail="Cannot delete product with order history.",
        )

    db.query(Recommendation).filter(
        Recommendation.product_id == product_id,
        Recommendation.user_id == current_user.id,
    ).delete(synchronize_session=False)

    db.query(Forecast).filter(
        Forecast.product_id == product_id,
        Forecast.user_id == current_user.id,
    ).delete(synchronize_session=False)

    db.query(Inventory).filter(
        Inventory.product_id == product_id,
    ).delete(synchronize_session=False)

    db.delete(db_product)
    db.commit()

    return {
        "message": "Product deleted successfully.",
        "product_id": product_id,
    }
