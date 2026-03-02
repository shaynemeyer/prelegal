"""Tests for document generation and history routes."""
from unittest.mock import patch

import pytest


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

async def _signup_and_token(client, email="user@example.com", password="pass123"):
    res = await client.post("/api/auth/signup", json={"email": email, "password": password})
    return res.json()["access_token"]


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


# ---------------------------------------------------------------------------
# Document history — save
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_save_document_requires_auth(client):
    res = await client.post(
        "/api/documents",
        json={"doc_type": "csa", "doc_name": "CSA", "fields": {}},
    )
    assert res.status_code == 401


@pytest.mark.asyncio
async def test_save_document_returns_201_with_id(client):
    token = await _signup_and_token(client)
    res = await client.post(
        "/api/documents",
        json={"doc_type": "csa", "doc_name": "Cloud Service Agreement", "fields": {"effectiveDate": "2025-01-01"}},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res.status_code == 201
    assert "id" in res.json()


# ---------------------------------------------------------------------------
# Document history — list
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_list_documents_requires_auth(client):
    res = await client.get("/api/documents")
    assert res.status_code == 401


@pytest.mark.asyncio
async def test_list_documents_returns_empty_for_new_user(client):
    token = await _signup_and_token(client)
    res = await client.get("/api/documents", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    assert res.json() == []


@pytest.mark.asyncio
async def test_list_documents_returns_saved_docs(client):
    token = await _signup_and_token(client)
    headers = {"Authorization": f"Bearer {token}"}
    fields = {"effectiveDate": "2025-01-01"}

    await client.post(
        "/api/documents",
        json={"doc_type": "csa", "doc_name": "CSA", "fields": fields},
        headers=headers,
    )
    await client.post(
        "/api/documents",
        json={"doc_type": "sla", "doc_name": "SLA", "fields": fields},
        headers=headers,
    )

    res = await client.get("/api/documents", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert len(data) == 2
    doc_types = {d["doc_type"] for d in data}
    assert doc_types == {"csa", "sla"}


@pytest.mark.asyncio
async def test_list_documents_isolated_per_user(client):
    token_a = await _signup_and_token(client, "a@example.com")
    token_b = await _signup_and_token(client, "b@example.com")

    await client.post(
        "/api/documents",
        json={"doc_type": "csa", "doc_name": "CSA", "fields": {}},
        headers={"Authorization": f"Bearer {token_a}"},
    )

    res = await client.get("/api/documents", headers={"Authorization": f"Bearer {token_b}"})
    assert res.json() == []


@pytest.mark.asyncio
async def test_save_document_persists_fields(client):
    token = await _signup_and_token(client)
    headers = {"Authorization": f"Bearer {token}"}
    fields = {"effectiveDate": "2025-06-01", "party": "Acme Corp"}

    await client.post(
        "/api/documents",
        json={"doc_type": "dpa", "doc_name": "DPA", "fields": fields},
        headers=headers,
    )

    res = await client.get("/api/documents", headers=headers)
    assert res.json()[0]["fields"] == fields
