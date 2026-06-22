from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def register_and_login(email: str = "demo-user@example.com") -> str:
    user_data = {
        "name": "Demo User",
        "email": email,
        "password": "StrongPassword123!",
    }

    client.post("/auth/register", json=user_data)

    response = client.post(
        "/auth/login",
        json={
            "email": email,
            "password": user_data["password"],
        },
    )

    assert response.status_code == 200

    return response.json()["access_token"]


def test_seed_demo_data_creates_user_workspace_data():
    token = register_and_login()

    response = client.post(
        "/demo/seed",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 200
    assert response.json()["products_created"] == 5

    headers = {"Authorization": f"Bearer {token}"}

    products_response = client.get("/products/", headers=headers)
    orders_response = client.get("/orders/", headers=headers)
    forecasts_response = client.get("/forecast/latest", headers=headers)
    recommendations_response = client.get("/recommendations/", headers=headers)

    assert products_response.status_code == 200
    assert orders_response.status_code == 200
    assert forecasts_response.status_code == 200
    assert recommendations_response.status_code == 200

    assert len(products_response.json()) == 5
    assert len(orders_response.json()) > 0
    assert len(forecasts_response.json()) == 5
    assert len(recommendations_response.json()) == 5


def test_seed_demo_data_is_user_scoped():
    first_user_token = register_and_login("first-demo-user@example.com")
    second_user_token = register_and_login("second-demo-user@example.com")

    first_headers = {"Authorization": f"Bearer {first_user_token}"}
    second_headers = {"Authorization": f"Bearer {second_user_token}"}

    response = client.post("/demo/seed", headers=first_headers)

    assert response.status_code == 200

    first_products = client.get("/products/", headers=first_headers)
    second_products = client.get("/products/", headers=second_headers)

    assert first_products.status_code == 200
    assert second_products.status_code == 200

    assert len(first_products.json()) == 5
    assert second_products.json() == []