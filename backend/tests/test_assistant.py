from uuid import uuid4
from fastapi.testclient import TestClient

from app.main import app
from tests.auth_helpers import get_auth_headers


client = TestClient(app)

def create_assistant_test_product(headers, name="Assistant Test Product"):
    response = client.post(
        "/products/",
        json={
            "sku": f"ASSISTANT-{uuid4()}",
            "name": name,
            "category": "Assistant Test",
            "reorder_threshold": 5,
            "unit_price": 10.99,
        },
        headers=headers,
    )

    assert response.status_code == 200

    return response.json()

def test_assistant_summary_requires_authentication():
    response = client.get("/assistant/summary")

    assert response.status_code in (401, 403)


def test_assistant_summary_returns_answer_and_actions():
    headers = get_auth_headers(client)

    response = client.get("/assistant/summary", headers=headers)

    assert response.status_code == 200

    data = response.json()

    assert "answer" in data
    assert "suggested_actions" in data
    assert "highlights" in data
    assert isinstance(data["answer"], str)
    assert isinstance(data["suggested_actions"], list)
    assert isinstance(data["highlights"], list)
    assert data["answer"] == "Here is your current operations summary."


def test_assistant_can_answer_low_stock_question():
    headers = get_auth_headers(client)

    response = client.post(
        "/assistant/ask",
        json={"question": "Which products are low stock?"},
        headers=headers,
    )

    assert response.status_code == 200

    data = response.json()

    assert "answer" in data
    assert "suggested_actions" in data
    assert "highlights" in data
    assert isinstance(data["answer"], str)
    assert isinstance(data["suggested_actions"], list)
    assert isinstance(data["highlights"], list)

def test_assistant_can_answer_unknown_question_with_suggestions():
    headers = get_auth_headers(client)

    response = client.post(
        "/assistant/ask",
        json={"question": "Can you help me?"},
        headers=headers,
    )

    assert response.status_code == 200

    data = response.json()

    assert "I can help" in data["answer"]
    assert len(data["suggested_actions"]) > 0
    assert len(data["highlights"]) > 0

def test_assistant_can_answer_recent_activity_question():
    headers = get_auth_headers(client)

    response = client.post(
        "/assistant/ask",
        json={"question": "What changed recently?"},
        headers=headers,
    )

    assert response.status_code == 200

    data = response.json()

    assert "answer" in data
    assert "highlights" in data
    assert "suggested_actions" in data
    assert isinstance(data["answer"], str)
    assert isinstance(data["highlights"], list)
    assert isinstance(data["suggested_actions"], list)

def test_assistant_recent_activity_is_scoped_to_authenticated_user():
    owner_headers = get_auth_headers(client)
    other_user_headers = get_auth_headers(client)

    product = create_assistant_test_product(
        owner_headers,
        name="Private Assistant Product",
    )

    stock_response = client.patch(
        f"/inventory/{product['id']}",
        json={"current_stock": 5},
        headers=owner_headers,
    )
    assert stock_response.status_code == 200

    order_response = client.post(
        "/orders/",
        json={
            "product_id": product["id"],
            "quantity": 1,
            "source": "assistant-isolation-test",
        },
        headers=owner_headers,
    )
    assert order_response.status_code == 200

    owner_response = client.post(
        "/assistant/ask",
        json={"question": "What changed recently?"},
        headers=owner_headers,
    )
    assert owner_response.status_code == 200
    assert "Private Assistant Product" in owner_response.json()["highlights"][0]

    other_user_response = client.post(
        "/assistant/ask",
        json={"question": "What changed recently?"},
        headers=other_user_headers,
    )
    assert other_user_response.status_code == 200

    other_user_data = other_user_response.json()
    other_user_text = " ".join(
        [other_user_data["answer"], *other_user_data["highlights"]]
    )

    assert "Private Assistant Product" not in other_user_text

def test_assistant_can_answer_healthy_inventory_question():
    headers = get_auth_headers(client)

    response = client.post(
        "/assistant/ask",
        json={"question": "Which products are healthy?"},
        headers=headers,
    )

    assert response.status_code == 200

    data = response.json()

    assert "answer" in data
    assert "highlights" in data
    assert "suggested_actions" in data
    assert isinstance(data["answer"], str)
    assert isinstance(data["highlights"], list)
    assert isinstance(data["suggested_actions"], list)

def test_assistant_can_answer_forecast_freshness_question():
    headers = get_auth_headers(client)

    response = client.post(
        "/assistant/ask",
        json={"question": "Do I need to generate forecasts?"},
        headers=headers,
    )

    assert response.status_code == 200

    data = response.json()

    assert "answer" in data
    assert "highlights" in data
    assert "suggested_actions" in data
    assert isinstance(data["answer"], str)
    assert isinstance(data["highlights"], list)
    assert isinstance(data["suggested_actions"], list)