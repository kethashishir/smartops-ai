from fastapi import FastAPI
from app.routers import products, inventory, order
from app.database import Base, engine
from app.models import product, inventories, forecast, recommendation, user, orders  # Ensure the Product and Category models are imported so they're registered with SQLAlchemy

app = FastAPI()

@app.get("/health")
async def health():
    return {"status": "healthy"}

app.include_router(products.router)
app.include_router(order.router)
app.include_router(inventory.router)

@app.get("/")
async def root():
    return {"message": "Welcome to the Inventory Management API!"}

# Create tables if they don't exist
Base.metadata.create_all(bind=engine)

