from fastapi.testclient import TestClient
from tests.auth_helpers import get_auth_headers

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
    headers = get_auth_headers(client)
    products_response = client.get("/products/", headers=headers)
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


def test_create_valid_order_reduces_inventory_and_restores_stock():
    headers = get_auth_headers(client)
    products_response = client.get("/products/", headers=headers)
    assert products_response.status_code == 200

    products = products_response.json()
    assert len(products) > 0

    selected_product = None
    selected_inventory = None

    for product in products:
        inventory_response = client.get(f"/inventory/{product['id']}")

        if inventory_response.status_code != 200:
            continue

        inventory = inventory_response.json()

        if inventory["current_stock"] > 0:
            selected_product = product
            selected_inventory = inventory
            break

    assert selected_product is not None
    assert selected_inventory is not None

    original_stock = selected_inventory["current_stock"]

    order_response = client.post(
        "/orders/",
        json={
            "product_id": selected_product["id"],
            "quantity": 1,
            "source": "pytest-valid-order-test",
        },
    )

    try:
        assert order_response.status_code == 200

        updated_inventory_response = client.get(
            f"/inventory/{selected_product['id']}"
        )
        assert updated_inventory_response.status_code == 200

        updated_stock = updated_inventory_response.json()["current_stock"]
        assert updated_stock == original_stock - 1
    finally:
        restore_response = client.patch(
            f"/inventory/{selected_product['id']}",
            json={"current_stock": original_stock},
        )

        assert restore_response.status_code == 200