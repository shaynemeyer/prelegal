from unittest.mock import patch

import pytest


async def _get_token(client) -> str:
    res = await client.post("/api/auth/signup", json={"email": "chat@example.com", "password": "pass123"})
    return res.json()["access_token"]


@pytest.mark.asyncio
async def test_chat_no_token_returns_403(client):
    res = await client.post("/api/chat", json={"messages": []})
    assert res.status_code == 401


@pytest.mark.asyncio
async def test_chat_invalid_token_returns_401(client):
    res = await client.post(
        "/api/chat",
        json={"messages": []},
        headers={"Authorization": "Bearer bad.token.here"},
    )
    assert res.status_code == 401


@pytest.mark.asyncio
async def test_chat_returns_message_and_fields(client):
    token = await _get_token(client)
    mock_result = {
        "message": "Hello! What is the purpose of this NDA?",
        "fields": {"governingLaw": "Delaware"},
    }
    with patch("app.routes.chat.call_ai", return_value=mock_result):
        res = await client.post(
            "/api/chat",
            json={"messages": [{"role": "user", "content": "Hello"}]},
            headers={"Authorization": f"Bearer {token}"},
        )
    assert res.status_code == 200
    data = res.json()
    assert data["message"] == "Hello! What is the purpose of this NDA?"
    assert data["fields"]["governingLaw"] == "Delaware"


@pytest.mark.asyncio
async def test_chat_empty_messages_ok(client):
    token = await _get_token(client)
    mock_result = {"message": "Hi there!", "fields": {}}
    with patch("app.routes.chat.call_ai", return_value=mock_result):
        res = await client.post(
            "/api/chat",
            json={"messages": []},
            headers={"Authorization": f"Bearer {token}"},
        )
    assert res.status_code == 200
    data = res.json()
    assert data["message"] == "Hi there!"
    assert data["fields"] == {}


@pytest.mark.asyncio
async def test_chat_returns_nested_party_fields(client):
    token = await _get_token(client)
    mock_result = {
        "message": "Got it. Who are the parties?",
        "fields": {
            "party1": {"company": "Acme Corp"},
            "party2": {"company": "Widget Inc"},
        },
    }
    with patch("app.routes.chat.call_ai", return_value=mock_result):
        res = await client.post(
            "/api/chat",
            json={"messages": [{"role": "user", "content": "Software partnership"}]},
            headers={"Authorization": f"Bearer {token}"},
        )
    assert res.status_code == 200
    data = res.json()
    assert data["fields"]["party1"]["company"] == "Acme Corp"
    assert data["fields"]["party2"]["company"] == "Widget Inc"
