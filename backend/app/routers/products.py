from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.product import Product
from app.schemas.product import ProductCreate, ProductResponse

router = APIRouter(prefix="/products", tags=["products"])

@router.post("/", response_model=ProductResponse)
def create_product(product: ProductCreate, db: Session = Depends(get_db)):
    db_product = Product(
        sku=product.sku,
        name=product.name,
        category=product.category,
        reorder_threshold=product.reorder_threshold,
        unit_price=product.unit_price
    )
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product   

@router.get("/", response_model=list[ProductResponse])
def get_products(db: Session = Depends(get_db)):
    products = db.query(Product).all()
    return products
