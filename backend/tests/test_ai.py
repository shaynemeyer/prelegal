from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from app.ai import call_ai, _get_system_prompt, _PROMPTS


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
async def test_call_ai_sends_nda_system_prompt_by_default():
    mock_response = MagicMock()
    mock_response.choices[0].message.content = '{"message": "Hi", "fields": {}}'

    with patch("app.ai._client") as mock_client, patch("app.ai.OPENROUTER_API_KEY", "test-key"):
        mock_client.chat.completions.create = AsyncMock(return_value=mock_response)
        await call_ai([{"role": "user", "content": "Hello"}])

    call_args = mock_client.chat.completions.create.call_args
    messages = call_args.kwargs["messages"]
    assert messages[0]["role"] == "system"
    assert "Non-Disclosure Agreement" in messages[0]["content"]
    assert messages[1]["role"] == "user"


@pytest.mark.asyncio
@pytest.mark.parametrize("doc_type", list(_PROMPTS.keys()))
async def test_call_ai_uses_correct_prompt_per_doc_type(doc_type):
    mock_response = MagicMock()
    mock_response.choices[0].message.content = '{"message": "Hi", "fields": {}}'

    with patch("app.ai._client") as mock_client, patch("app.ai.OPENROUTER_API_KEY", "test-key"):
        mock_client.chat.completions.create = AsyncMock(return_value=mock_response)
        await call_ai([{"role": "user", "content": "Hello"}], doc_type=doc_type)

    call_args = mock_client.chat.completions.create.call_args
    messages = call_args.kwargs["messages"]
    assert messages[0]["role"] == "system"
    assert len(messages[0]["content"]) > 100


def test_get_system_prompt_returns_fallback_for_unknown_type():
    prompt = _get_system_prompt("unknown-document-xyz")
    assert "unknown-document-xyz" in prompt
    assert "Supported" in prompt


@pytest.mark.parametrize("doc_type", list(_PROMPTS.keys()))
def test_system_prompts_require_follow_up_questions(doc_type):
    """Every system prompt must instruct the AI to ask follow-up questions."""
    prompt = _get_system_prompt(doc_type)
    assert "follow-up question" in prompt.lower() or "ask" in prompt.lower()


@pytest.mark.parametrize("doc_type", list(_PROMPTS.keys()))
def test_system_prompts_specify_json_response_format(doc_type):
    """Every system prompt must specify the JSON response format."""
    prompt = _get_system_prompt(doc_type)
    assert '"message"' in prompt
    assert '"fields"' in prompt
