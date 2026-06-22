from decimal import Decimal

from sqlalchemy.orm import Session

from app.models.forecast import Forecast
from app.models.inventories import Inventory
from app.models.orders import Order
from app.models.product import Product
from app.models.recommendation import Recommendation
from app.services.forecast_service import generate_baseline_forecasts


DEMO_PRODUCTS = [
    {
        "sku": "DEMO-NOTHING-EAR",
        "name": "Nothing Ear",
        "category": "Electronics",
        "reorder_threshold": 50,
        "unit_price": Decimal("79.99"),
        "stock": 30,
        "orders": [8, 6, 12],
    },
    {
        "sku": "DEMO-USB-C-HUB",
        "name": "USB-C Hub",
        "category": "Accessories",
        "reorder_threshold": 35,
        "unit_price": Decimal("39.99"),
        "stock": 80,
        "orders": [10, 7],
    },
    {
        "sku": "DEMO-WIRELESS-MOUSE",
        "name": "Wireless Mouse",
        "category": "Accessories",
        "reorder_threshold": 25,
        "unit_price": Decimal("24.99"),
        "stock": 18,
        "orders": [5, 9, 4],
    },
    {
        "sku": "DEMO-LAPTOP-STAND",
        "name": "Laptop Stand",
        "category": "Office",
        "reorder_threshold": 20,
        "unit_price": Decimal("49.99"),
        "stock": 45,
        "orders": [3, 4],
    },
    {
        "sku": "DEMO-NOTEBOOK",
        "name": "Premium Notebook",
        "category": "Office",
        "reorder_threshold": 60,
        "unit_price": Decimal("14.99"),
        "stock": 120,
        "orders": [15, 18, 10],
    },
]


def clear_user_demo_data(db: Session, user_id: int) -> None:
    demo_products = (
        db.query(Product)
        .filter(Product.user_id == user_id)
        .filter(
            Product.sku.like(f"DEMO-U{user_id}-%")
            | Product.sku.in_([product["sku"] for product in DEMO_PRODUCTS])
        )
        .all()
    )

    demo_product_ids = [product.id for product in demo_products]

    if not demo_product_ids:
        return

    db.query(Recommendation).filter(
        Recommendation.user_id == user_id,
        Recommendation.product_id.in_(demo_product_ids),
    ).delete(synchronize_session=False)

    db.query(Forecast).filter(
        Forecast.user_id == user_id,
        Forecast.product_id.in_(demo_product_ids),
    ).delete(synchronize_session=False)

    db.query(Order).filter(
        Order.user_id == user_id,
        Order.product_id.in_(demo_product_ids),
    ).delete(synchronize_session=False)

    db.query(Inventory).filter(
        Inventory.product_id.in_(demo_product_ids),
    ).delete(synchronize_session=False)

    db.query(Product).filter(
        Product.user_id == user_id,
        Product.id.in_(demo_product_ids),
    ).delete(synchronize_session=False)


def seed_demo_data(db: Session, user_id: int) -> dict:
    clear_user_demo_data(db, user_id)

    created_products = []

    for demo_product in DEMO_PRODUCTS:
        product = Product(
            user_id=user_id,
            sku=f"DEMO-U{user_id}-{demo_product['sku'].replace('DEMO-', '')}",
            name=demo_product["name"],
            category=demo_product["category"],
            reorder_threshold=demo_product["reorder_threshold"],
            unit_price=demo_product["unit_price"],
        )
        db.add(product)
        db.flush()

        inventory = Inventory(
            product_id=product.id,
            current_stock=demo_product["stock"],
        )
        db.add(inventory)

        for quantity in demo_product["orders"]:
            db.add(
                Order(
                    user_id=user_id,
                    product_id=product.id,
                    quantity=quantity,
                    source="demo",
                )
            )

        created_products.append(product)

    db.commit()

    generate_baseline_forecasts(db, user_id=user_id)

    for product in created_products:
        forecast = (
            db.query(Forecast)
            .filter(
                Forecast.user_id == user_id,
                Forecast.product_id == product.id,
                Forecast.model_version == "baseline-v1",
            )
            .order_by(Forecast.forecast_date.desc(), Forecast.id.desc())
            .first()
        )

        inventory = (
            db.query(Inventory)
            .filter(Inventory.product_id == product.id)
            .first()
        )

        if not forecast or not inventory:
            continue

        if inventory.current_stock <= product.reorder_threshold:
            recommended_quantity = max(
                int(forecast.predicted_demand) - inventory.current_stock,
                0,
            )
        else:
            recommended_quantity = 0

        reason = (
            f"Current inventory is {inventory.current_stock}, "
            f"forecasted demand is {forecast.predicted_demand}. "
            f"Recommended quantity is {recommended_quantity}."
        )

        db.add(
            Recommendation(
                user_id=user_id,
                product_id=product.id,
                recommended_quantity=recommended_quantity,
                reason=reason,
            )
        )

    db.commit()

    return {
        "message": "Demo data created successfully.",
        "products_created": len(created_products),
    }