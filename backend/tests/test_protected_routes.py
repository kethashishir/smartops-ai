from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_dashboard_routes_require_authentication():
    protected_requests = [
        ("GET", "/products/"),
        ("GET", "/inventory/1"),
        ("PATCH", "/inventory/1"),
        ("GET", "/orders/"),
        ("POST", "/orders/"),
        ("GET", "/forecast/"),
        ("GET", "/forecast/latest"),
        ("POST", "/forecast/generate"),
        ("GET", "/recommendations/"),
        ("POST", "/recommendations/generate_all"),
    ]

    for method, path in protected_requests:
        response = client.request(method, path)

        assert response.status_code in (401, 403), (
            f"{method} {path} should require authentication"
        )