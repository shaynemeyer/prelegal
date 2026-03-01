"""Tests for the generic document generation route."""
from unittest.mock import patch

import pytest


@pytest.mark.asyncio
async def test_generate_pdf_invalid_doc_type_returns_400(client):
    res = await client.post(
        "/api/documents/generate-pdf",
        json={"doc_type": "nonexistent", "fields": {}},
    )
    assert res.status_code == 400
    assert "Unsupported" in res.json()["detail"]


@pytest.mark.asyncio
@pytest.mark.parametrize("doc_type", ["csa", "sla", "psa", "dpa", "pilot"])
async def test_generate_pdf_valid_doc_type_returns_pdf(client, doc_type):
    with patch("app.routes.document.generate_document_pdf", return_value=b"%PDF fake"):
        res = await client.post(
            "/api/documents/generate-pdf",
            json={"doc_type": doc_type, "fields": {"effectiveDate": "2025-01-01"}},
        )
    assert res.status_code == 200
    assert res.headers["content-type"] == "application/pdf"


@pytest.mark.asyncio
async def test_generate_pdf_includes_correct_filename(client):
    with patch("app.routes.document.generate_document_pdf", return_value=b"%PDF fake"):
        res = await client.post(
            "/api/documents/generate-pdf",
            json={"doc_type": "csa", "fields": {}},
        )
    assert "cloud-service-agreement.pdf" in res.headers.get("content-disposition", "")
