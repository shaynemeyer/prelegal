"""Tests for the NDA PDF generation route."""
from unittest.mock import AsyncMock, patch

import pytest


def _payload():
    return {
        "purpose": "Partnership evaluation",
        "effective_date": "2025-01-01",
        "mnda_term_type": "expires",
        "mnda_term_years": 1,
        "confidentiality_type": "years",
        "confidentiality_years": 2,
        "governing_law": "California",
        "jurisdiction": "San Francisco County",
        "party1": {
            "print_name": "Alice Smith",
            "title": "CEO",
            "company": "Acme Corp",
            "notice_address": "123 Main St",
            "date": "2025-01-01",
        },
        "party2": {
            "print_name": "Bob Jones",
            "title": "CTO",
            "company": "Widget Inc",
            "notice_address": "456 Oak Ave",
            "date": "2025-01-01",
        },
    }


@pytest.mark.asyncio
async def test_generate_pdf_returns_application_pdf(client):
    with patch("app.routes.nda.generate_nda_pdf", new=AsyncMock(return_value=b"%PDF-fake")):
        res = await client.post("/api/nda/generate-pdf", json=_payload())
    assert res.status_code == 200
    assert res.headers["content-type"] == "application/pdf"


@pytest.mark.asyncio
async def test_generate_pdf_returns_correct_filename(client):
    with patch("app.routes.nda.generate_nda_pdf", new=AsyncMock(return_value=b"%PDF-fake")):
        res = await client.post("/api/nda/generate-pdf", json=_payload())
    assert "mutual-nda.pdf" in res.headers.get("content-disposition", "")


@pytest.mark.asyncio
async def test_generate_pdf_missing_required_field_returns_422(client):
    payload = _payload()
    del payload["purpose"]
    res = await client.post("/api/nda/generate-pdf", json=payload)
    assert res.status_code == 422
