from uuid import uuid4

from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_register_user_returns_created_user():
    unique_email = f"test-{uuid4()}@smartops.ai"

    response = client.post(
        "/auth/register",
        json={
            "name": "Test User",
            "email": unique_email,
            "password": "test123",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["email"] == unique_email
    assert data["name"] == "Test User"
    assert "id" in data
    assert "created_at" in data
    assert "password" not in data
    assert "hashed_password" not in data


def test_login_user_returns_access_token():
    unique_email = f"test-{uuid4()}@smartops.ai"
    password = "test123"

    register_response = client.post(
        "/auth/register",
        json={
            "name": "Login Test User",
            "email": unique_email,
            "password": password,
        },
    )

    assert register_response.status_code == 200

    login_response = client.post(
        "/auth/login",
        json={
            "email": unique_email,
            "password": password,
        },
    )

    assert login_response.status_code == 200

    data = login_response.json()

    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == unique_email
    assert data["user"]["name"] == "Login Test User"


def test_login_user_rejects_invalid_password():
    unique_email = f"test-{uuid4()}@smartops.ai"

    register_response = client.post(
        "/auth/register",
        json={
            "name": "Invalid Login Test User",
            "email": unique_email,
            "password": "correct-password",
        },
    )

    assert register_response.status_code == 200

    login_response = client.post(
        "/auth/login",
        json={
            "email": unique_email,
            "password": "wrong-password",
        },
    )

    assert login_response.status_code == 401
    assert login_response.json()["detail"] == "Invalid email or password"