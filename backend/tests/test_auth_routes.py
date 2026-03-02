from datetime import datetime, timedelta, timezone

import pytest
from jose import jwt

from app.auth import create_access_token
from app.config import JWT_ALGORITHM, JWT_SECRET_KEY


@pytest.mark.asyncio
async def test_signup_returns_token(client):
    res = await client.post("/api/auth/signup", json={"email": "a@example.com", "password": "pass123"})
    assert res.status_code == 201
    data = res.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert isinstance(data["access_token"], str)


@pytest.mark.asyncio
async def test_signup_duplicate_email_returns_400(client):
    payload = {"email": "dup@example.com", "password": "pass123"}
    await client.post("/api/auth/signup", json=payload)
    res = await client.post("/api/auth/signup", json=payload)
    assert res.status_code == 400
    assert "already registered" in res.json()["detail"]


@pytest.mark.asyncio
async def test_signup_invalid_email_returns_422(client):
    res = await client.post("/api/auth/signup", json={"email": "not-an-email", "password": "pass"})
    assert res.status_code == 422


@pytest.mark.asyncio
async def test_login_returns_token(client):
    await client.post("/api/auth/signup", json={"email": "b@example.com", "password": "pass123"})
    res = await client.post("/api/auth/login", json={"email": "b@example.com", "password": "pass123"})
    assert res.status_code == 200
    assert "access_token" in res.json()


@pytest.mark.asyncio
async def test_login_wrong_password_returns_401(client):
    await client.post("/api/auth/signup", json={"email": "c@example.com", "password": "correct"})
    res = await client.post("/api/auth/login", json={"email": "c@example.com", "password": "wrong"})
    assert res.status_code == 401
    assert "Invalid" in res.json()["detail"]


@pytest.mark.asyncio
async def test_login_unknown_email_returns_401(client):
    res = await client.post("/api/auth/login", json={"email": "ghost@example.com", "password": "pass"})
    assert res.status_code == 401


@pytest.mark.asyncio
async def test_health(client):
    res = await client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "healthy"


@pytest.mark.asyncio
async def test_root_returns_api_message(client):
    res = await client.get("/")
    assert res.status_code == 200
    assert res.json()["message"] == "Prelegal API"


@pytest.mark.asyncio
async def test_refresh_returns_new_token(client):
    res = await client.post("/api/auth/signup", json={"email": "refresh@example.com", "password": "pass123"})
    token = res.json()["access_token"]

    res = await client.post("/api/auth/refresh", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert len(data["access_token"].split(".")) == 3  # valid JWT structure


@pytest.mark.asyncio
async def test_refresh_without_token_returns_401(client):
    res = await client.post("/api/auth/refresh")
    assert res.status_code == 401


@pytest.mark.asyncio
async def test_refresh_with_invalid_token_returns_401(client):
    res = await client.post("/api/auth/refresh", headers={"Authorization": "Bearer invalid.token.here"})
    assert res.status_code == 401


@pytest.mark.asyncio
async def test_refresh_with_expired_token_returns_401(client):
    expired_payload = {
        "sub": "999",
        "email": "expired@example.com",
        "exp": datetime.now(timezone.utc) - timedelta(seconds=1),
    }
    expired_token = jwt.encode(expired_payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    res = await client.post("/api/auth/refresh", headers={"Authorization": f"Bearer {expired_token}"})
    assert res.status_code == 401


@pytest.mark.asyncio
async def test_refresh_for_deleted_user_returns_401(client):
    # Token is valid but the user no longer exists in the DB (sub=99999)
    ghost_payload = {
        "sub": "99999",
        "email": "ghost@example.com",
        "exp": datetime.now(timezone.utc) + timedelta(hours=1),
    }
    ghost_token = jwt.encode(ghost_payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    res = await client.post("/api/auth/refresh", headers={"Authorization": f"Bearer {ghost_token}"})
    assert res.status_code == 401
    assert res.json()["detail"] == "User not found"
