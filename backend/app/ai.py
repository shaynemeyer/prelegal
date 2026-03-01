import json
import logging

import openai

from app.config import OPENROUTER_API_KEY

logger = logging.getLogger(__name__)

_client = openai.AsyncOpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=OPENROUTER_API_KEY,
)

_SYSTEM_PROMPT = """You are a legal document assistant helping a user fill out a Mutual Non-Disclosure Agreement (MNDA).

Have a natural, friendly conversation. Ask one or two questions at a time to collect the required information.
When you first respond, greet the user and ask what the NDA is for.

Fields to collect:
- purpose: string (how confidential information may be used)
- effectiveDate: string YYYY-MM-DD
- mndaTermType: exactly "expires" or "continues"
- mndaTermYears: integer (only when mndaTermType is "expires")
- confidentialityType: exactly "years" or "perpetuity"
- confidentialityYears: integer (only when confidentialityType is "years")
- governingLaw: string (US state name, e.g. "Delaware")
- jurisdiction: string (e.g. "New Castle County, Delaware")
- modifications: string or null (optional deviations from standard terms)
- party1: { printName, title, company, noticeAddress, date (YYYY-MM-DD) }
- party2: { printName, title, company, noticeAddress, date (YYYY-MM-DD) }

Rules:
- Only include a field in "fields" once you are confident of its value.
- Dates must be in YYYY-MM-DD format.
- Party dates default to the effective date if the user does not specify.
- Return ONLY valid JSON — no markdown fences or extra text.

Response format (always return this exact structure):
{
  "message": "your conversational reply",
  "fields": { ...only the fields you are confident about, using nested objects for party1/party2... }
}

Example fields object:
{
  "governingLaw": "California",
  "party1": { "company": "Acme Corp", "printName": "Jane Smith" },
  "party2": { "company": "Widget Inc" }
}
"""


async def call_ai(messages: list[dict]) -> dict:
    """Send conversation history to OpenRouter. Returns {message, fields}."""
    if not OPENROUTER_API_KEY:
        logger.error("OPENROUTER_API_KEY not configured")
        return {"message": "AI assistant is not configured. Please contact support.", "fields": {}}

    openai_messages = [{"role": "system", "content": _SYSTEM_PROMPT}] + messages

    try:
        response = await _client.chat.completions.create(
            model="openai/gpt-4o-mini",
            messages=openai_messages,
            response_format={"type": "json_object"},
        )
        content = response.choices[0].message.content
        result = json.loads(content)
        return {"message": result.get("message", ""), "fields": result.get("fields", {})}
    except (json.JSONDecodeError, TypeError) as exc:
        logger.error("AI response was not valid JSON: %s", exc)
        return {"message": "I had trouble processing that. Could you rephrase?", "fields": {}}
