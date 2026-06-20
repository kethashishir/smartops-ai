from uuid import uuid4

from fastapi.testclient import TestClient

from app.main import app
from tests.auth_helpers import get_auth_headers


client = TestClient(app)


def create_test_product(headers):
    response = client.post(
        "/products/",
        json={
            "sku": f"TEST-{uuid4()}",
            "name": "Test Product",
            "category": "Test Category",
            "reorder_threshold": 5,
            "unit_price": 10.99,
        },
        headers=headers,
    )

    assert response.status_code == 200

    return response.json()


def test_create_order_rejects_missing_product():
    headers = get_auth_headers(client)

    response = client.post(
        "/orders/",
        json={
            "product_id": 999999,
            "quantity": 1,
            "source": "test",
        },
        headers=headers,
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Product not found"


def test_create_order_rejects_insufficient_stock():
    headers = get_auth_headers(client)
    product = create_test_product(headers)

    inventory_response = client.get(
        f"/inventory/{product['id']}",
        headers=headers,
    )
    assert inventory_response.status_code == 200

    current_stock = inventory_response.json()["current_stock"]

    response = client.post(
        "/orders/",
        json={
            "product_id": product["id"],
            "quantity": current_stock + 1,
            "source": "test",
        },
        headers=headers,
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Not enough stock"


def test_create_valid_order_reduces_inventory_and_restores_stock():
    headers = get_auth_headers(client)
    product = create_test_product(headers)

    seed_stock_response = client.patch(
        f"/inventory/{product['id']}",
        json={"current_stock": 3},
        headers=headers,
    )
    assert seed_stock_response.status_code == 200

    original_stock = seed_stock_response.json()["current_stock"]

    order_response = client.post(
        "/orders/",
        json={
            "product_id": product["id"],
            "quantity": 1,
            "source": "pytest-valid-order-test",
        },
        headers=headers,
    )

    try:
        assert order_response.status_code == 200

        updated_inventory_response = client.get(
            f"/inventory/{product['id']}",
            headers=headers,
        )
        assert updated_inventory_response.status_code == 200

        updated_stock = updated_inventory_response.json()["current_stock"]
        assert updated_stock == original_stock - 1
    finally:
        restore_response = client.patch(
            f"/inventory/{product['id']}",
            json={"current_stock": original_stock},
            headers=headers,
        )

        assert restore_response.status_code == 200
    
def test_inventory_rejects_product_owned_by_another_user():
    owner_headers = get_auth_headers(client)
    other_user_headers = get_auth_headers(client)

    product = create_test_product(owner_headers)

    get_response = client.get(
        f"/inventory/{product['id']}",
        headers=other_user_headers,
    )
    assert get_response.status_code == 404
    assert get_response.json()["detail"] == "Product not found"

    update_response = client.patch(
        f"/inventory/{product['id']}",
        json={"current_stock": 10},
        headers=other_user_headers,
    )
    assert update_response.status_code == 404
    assert update_response.json()["detail"] == "Product not found"

def test_orders_are_scoped_to_authenticated_user():
    owner_headers = get_auth_headers(client)
    other_user_headers = get_auth_headers(client)

    product = create_test_product(owner_headers)

    seed_stock_response = client.patch(
        f"/inventory/{product['id']}",
        json={"current_stock": 5},
        headers=owner_headers,
    )
    assert seed_stock_response.status_code == 200

    order_response = client.post(
        "/orders/",
        json={
            "product_id": product["id"],
            "quantity": 1,
            "source": "ownership-test",
        },
        headers=owner_headers,
    )
    assert order_response.status_code == 200

    owner_orders_response = client.get("/orders/", headers=owner_headers)
    assert owner_orders_response.status_code == 200

    owner_order_ids = {
        order["id"] for order in owner_orders_response.json()
    }
    assert order_response.json()["id"] in owner_order_ids

    other_orders_response = client.get("/orders/", headers=other_user_headers)
    assert other_orders_response.status_code == 200

    other_order_ids = {
        order["id"] for order in other_orders_response.json()
    }
    assert order_response.json()["id"] not in other_order_ids

    unauthorized_order_response = client.post(
        "/orders/",
        json={
            "product_id": product["id"],
            "quantity": 1,
            "source": "unauthorized-ownership-test",
        },
        headers=other_user_headers,
    )
    assert unauthorized_order_response.status_code == 404
    assert unauthorized_order_response.json()["detail"] == "Product not found"