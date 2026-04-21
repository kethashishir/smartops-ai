from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.product import Product
from app.models.inventories import Inventory
from app.schemas.product import ProductCreate, ProductResponse

router = APIRouter(prefix="/products", tags=["products"])

@router.post("/", response_model=ProductResponse)
def create_product(product: ProductCreate, db: Session = Depends(get_db)):
    #Create the product record in the database
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

    # Create an inventory record for the new product with initial stock of 0
    db_inventory = Inventory(
        product_id=db_product.id,
        current_stock=0
    )
    db.add(db_inventory)
    db.commit()
    db.refresh(db_inventory)


    return db_product   

@router.get("/", response_model=list[ProductResponse])
def get_products(db: Session = Depends(get_db)):
    products = db.query(Product).all()
    return products

@router.patch("/{product_id}", response_model=ProductResponse)
def update_product(product_id: int, product: ProductCreate, db: Session = Depends(get_db)):
    db_product = db.query(Product).filter(Product.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    db_product.sku = product.sku
    db_product.name = product.name
    db_product.category = product.category
    db_product.reorder_threshold = product.reorder_threshold
    db_product.unit_price = product.unit_price
    
    db.commit()
    db.refresh(db_product)
    return db_product