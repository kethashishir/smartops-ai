from uuid import uuid4


def get_auth_headers(client):
    unique_email = f"test-{uuid4()}@smartops.ai"
    password = "test123"

    register_response = client.post(
        "/auth/register",
        json={
            "name": "Test User",
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

    access_token = login_response.json()["access_token"]

    return {"Authorization": f"Bearer {access_token}"}