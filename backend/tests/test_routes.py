from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_products_endpoint_returns_success():
    response = client.get("/products/")

    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_orders_endpoint_returns_success():
    response = client.get("/orders/")

    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_forecast_endpoint_returns_success_or_not_found():
    response = client.get("/forecast/")

    assert response.status_code in [200, 404]

    if response.status_code == 200:
        assert isinstance(response.json(), list)


def test_recommendations_endpoint_returns_success():
    response = client.get("/recommendations/")

    assert response.status_code == 200
    assert isinstance(response.json(), list)
    
def test_get_latest_forecasts_returns_list_or_not_found():
    response = client.get("/forecast/latest")

    assert response.status_code in [200, 404]

    if response.status_code == 200:
        forecasts = response.json()

        assert isinstance(forecasts, list)

        product_ids = [forecast["product_id"] for forecast in forecasts]
        assert len(product_ids) == len(set(product_ids))