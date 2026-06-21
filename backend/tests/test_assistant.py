from fastapi.testclient import TestClient

from app.main import app
from tests.auth_helpers import get_auth_headers


client = TestClient(app)


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
    assert isinstance(data["answer"], str)
    assert isinstance(data["suggested_actions"], list)


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
    assert isinstance(data["answer"], str)
    assert isinstance(data["suggested_actions"], list)


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