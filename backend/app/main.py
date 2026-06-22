import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.models import forecast, inventories, orders, product, recommendation, user
from app.routers import (
    assistant,
    auth,
    demo,
    forecast as forecast_router,
    inventory,
    order,
    products,
    recommendation,
)

app = FastAPI()

allowed_origins = [
    origin.strip()
    for origin in os.getenv(
        "ALLOWED_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173",
    ).split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    return {"status": "healthy"}


app.include_router(products.router)
app.include_router(order.router)
app.include_router(inventory.router)
app.include_router(forecast_router.router)
app.include_router(recommendation.router)
app.include_router(auth.router)
app.include_router(assistant.router)
app.include_router(demo.router)


@app.get("/")
async def root():
    return {"message": "Welcome to the Inventory Management API!"}


if os.getenv("AUTO_CREATE_TABLES", "false").lower() == "true":
    Base.metadata.create_all(bind=engine)