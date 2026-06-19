from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_create_order_rejects_missing_product():
    response = client.post(
        "/orders/",
        json={
            "product_id": 999999,
            "quantity": 1,
            "source": "test",
        },
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Product not found"


def test_create_order_rejects_insufficient_stock():
    products_response = client.get("/products/")
    assert products_response.status_code == 200

    products = products_response.json()
    assert len(products) > 0

    product = products[0]

    inventory_response = client.get(f"/inventory/{product['id']}")
    assert inventory_response.status_code == 200

    current_stock = inventory_response.json()["current_stock"]

    response = client.post(
        "/orders/",
        json={
            "product_id": product["id"],
            "quantity": current_stock + 1,
            "source": "test",
        },
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Not enough stock"