from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from app.ai import call_ai


@pytest.mark.asyncio
async def test_call_ai_no_api_key_returns_error(monkeypatch):
    monkeypatch.setattr("app.ai.OPENROUTER_API_KEY", "")
    result = await call_ai([{"role": "user", "content": "Hello"}])
    assert "not configured" in result["message"].lower()
    assert result["fields"] == {}


@pytest.mark.asyncio
async def test_call_ai_returns_parsed_response():
    mock_response = MagicMock()
    mock_response.choices[0].message.content = '{"message": "Hello!", "fields": {"governingLaw": "Delaware"}}'

    with patch("app.ai._client") as mock_client:
        mock_client.chat.completions.create = AsyncMock(return_value=mock_response)
        result = await call_ai([{"role": "user", "content": "Hello"}])

    assert result["message"] == "Hello!"
    assert result["fields"]["governingLaw"] == "Delaware"


@pytest.mark.asyncio
async def test_call_ai_invalid_json_returns_fallback():
    mock_response = MagicMock()
    mock_response.choices[0].message.content = "not valid json"

    with patch("app.ai._client") as mock_client, patch("app.ai.OPENROUTER_API_KEY", "test-key"):
        mock_client.chat.completions.create = AsyncMock(return_value=mock_response)
        result = await call_ai([{"role": "user", "content": "Hello"}])

    assert "rephrase" in result["message"].lower()
    assert result["fields"] == {}


@pytest.mark.asyncio
async def test_call_ai_sends_system_prompt_in_messages():
    mock_response = MagicMock()
    mock_response.choices[0].message.content = '{"message": "Hi", "fields": {}}'

    with patch("app.ai._client") as mock_client, patch("app.ai.OPENROUTER_API_KEY", "test-key"):
        mock_client.chat.completions.create = AsyncMock(return_value=mock_response)
        await call_ai([{"role": "user", "content": "Hello"}])

    call_args = mock_client.chat.completions.create.call_args
    messages = call_args.kwargs["messages"]
    assert messages[0]["role"] == "system"
    assert "NDA" in messages[0]["content"]
    assert messages[1]["role"] == "user"
