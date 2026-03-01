import pytest


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
