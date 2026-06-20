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

    assert response.status_code in [200, 404]

def test_recommendations_endpoint_returns_success():
    headers = get_auth_headers(client)

    response = client.get("/recommendations/", headers=headers)

    assert response.status_code == 200
    
def test_get_latest_forecasts_returns_list_or_not_found():
    headers = get_auth_headers(client)

    response = client.get("/forecast/latest", headers=headers)

    assert response.status_code in [200, 404]

def test_generate_forecasts_returns_generation_summary():
    headers = get_auth_headers(client)

    response = client.post("/forecast/generate", headers=headers)

    assert response.status_code == 200

    result = response.json()

    assert result["model_version"] == "baseline-v1"
    assert "forecast_date" in result
    assert "created_count" in result
    assert "updated_count" in result