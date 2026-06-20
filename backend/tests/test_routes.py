from uuid import uuid4

from fastapi.testclient import TestClient
from tests.auth_helpers import get_auth_headers

from app.main import app


client = TestClient(app)


def test_products_endpoint_returns_success():
    headers = get_auth_headers(client)
    response = client.get("/products/", headers=headers)

    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_orders_endpoint_returns_success():
    headers = get_auth_headers(client)

    response = client.get("/orders/", headers=headers)

    assert response.status_code == 200

def test_forecast_endpoint_returns_success_or_not_found():
    headers = get_auth_headers(client)

    response = client.get("/forecast/", headers=headers)

    assert response.status_code == 200

def test_recommendations_endpoint_returns_success_or_not_found():
    headers = get_auth_headers(client)

    response = client.get("/recommendations/", headers=headers)

    assert response.status_code == 200
    
def test_get_latest_forecasts_returns_list_or_not_found():
    headers = get_auth_headers(client)

    response = client.get("/forecast/latest", headers=headers)

    assert response.status_code == 200

def test_generate_forecasts_returns_generation_summary():
    headers = get_auth_headers(client)

    response = client.post("/forecast/generate", headers=headers)

    assert response.status_code == 200

    result = response.json()

    assert result["model_version"] == "baseline-v1"
    assert "forecast_date" in result
    assert "created_count" in result
    assert "updated_count" in result

def create_route_test_product(headers):
    response = client.post(
        "/products/",
        json={
            "sku": f"ROUTE-TEST-{uuid4()}",
            "name": "Route Test Product",
            "category": "Route Test Category",
            "reorder_threshold": 5,
            "unit_price": 19.99,
        },
        headers=headers,
    )

    assert response.status_code == 200

    return response.json()


def test_products_are_scoped_to_authenticated_user():
    owner_headers = get_auth_headers(client)
    other_user_headers = get_auth_headers(client)

    product = create_route_test_product(owner_headers)

    owner_products_response = client.get("/products/", headers=owner_headers)
    assert owner_products_response.status_code == 200

    owner_product_ids = {
        product["id"] for product in owner_products_response.json()
    }
    assert product["id"] in owner_product_ids

    other_products_response = client.get("/products/", headers=other_user_headers)
    assert other_products_response.status_code == 200

    other_product_ids = {
        product["id"] for product in other_products_response.json()
    }
    assert product["id"] not in other_product_ids

    unauthorized_update_response = client.patch(
        f"/products/{product['id']}",
        json={"name": "Unauthorized Update"},
        headers=other_user_headers,
    )
    assert unauthorized_update_response.status_code == 404
    assert unauthorized_update_response.json()["detail"] == "Product not found"