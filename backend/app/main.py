from fastapi import FastAPI
from app.routers import products
from app.database import Base, engine
from app.models import product, orders, inventory, forecast, recommendation, user  # Ensure the Product and Category models are imported so they're registered with SQLAlchemy

app = FastAPI()

@app.get("/health")
async def health():
    return {"status": "healthy"}

app.include_router(products.router)

@app.get("/")
async def root():
    return {"message": "Welcome to the Inventory Management API!"}

# Create tables if they don't exist
Base.metadata.create_all(bind=engine)

