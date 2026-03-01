"""Tests for the generic document service HTML helpers — no WeasyPrint required."""
from pathlib import Path

import pytest

from app.services.document_service import (
    _build_generic_cover_html,
    _build_standard_terms_html,
    _DOC_NAMES,
    _PARTY_KEYS,
    _TEMPLATE_MAP,
    generate_document_pdf,
)


def test_doc_names_matches_template_map():
    """Every template map entry should have a corresponding doc name."""
    assert set(_TEMPLATE_MAP.keys()) == set(_DOC_NAMES.keys())


def test_all_template_files_exist():
    """All template filenames in _TEMPLATE_MAP should exist under the templates directory."""
    templates_path = Path(__file__).parent.parent.parent / "templates"
    for filename in _TEMPLATE_MAP.values():
        assert (templates_path / filename).exists(), f"Missing template: {filename}"


@pytest.mark.parametrize("doc_type", list(_DOC_NAMES.keys()))
def test_build_generic_cover_html_renders_party_info(doc_type):
    p1_key, p2_key, _, _ = _PARTY_KEYS[doc_type]
    fields = {
        "effectiveDate": "2025-01-01",
        "governingLaw": "California",
        "jurisdiction": "Santa Clara County, California",
        p1_key: {"company": "Acme Corp", "printName": "Alice Smith", "title": "CEO"},
        p2_key: {"company": "Widget Inc", "printName": "Bob Jones", "title": "CTO"},
    }

    html = _build_generic_cover_html(doc_type, fields)
    assert "Acme Corp" in html
    assert "Widget Inc" in html


@pytest.mark.parametrize("doc_type", list(_DOC_NAMES.keys()))
def test_build_generic_cover_html_escapes_user_input(doc_type):
    p1_key, p2_key, _, _ = _PARTY_KEYS[doc_type]
    fields = {
        p1_key: {"company": "<script>alert(1)</script>"},
        p2_key: {"company": "Safe Corp"},
    }
    html = _build_generic_cover_html(doc_type, fields)
    assert "<script>" not in html
    assert "&lt;script&gt;" in html


@pytest.mark.parametrize("doc_type", list(_DOC_NAMES.keys()))
def test_build_standard_terms_html_returns_html(doc_type):
    template_file = _TEMPLATE_MAP[doc_type]
    html = _build_standard_terms_html(template_file)
    assert "<" in html and ">" in html
    assert len(html) > 100


@pytest.mark.asyncio
async def test_generate_document_pdf_raises_for_unknown_type():
    with pytest.raises(ValueError, match="Unsupported"):
        await generate_document_pdf("unknown-type", {})


@pytest.mark.asyncio
async def test_generate_document_pdf_returns_bytes():
    from unittest.mock import AsyncMock, patch

    with patch("app.services.pdf_utils.html_to_pdf", new=AsyncMock(return_value=b"%PDF-fake")):
        result = await generate_document_pdf("csa", {"effectiveDate": "2025-01-01"})
    assert result == b"%PDF-fake"


@pytest.mark.asyncio
async def test_generate_document_pdf_calls_html_to_pdf_with_html():
    from unittest.mock import AsyncMock, patch

    with patch("app.services.pdf_utils.html_to_pdf", new=AsyncMock(return_value=b"%PDF-fake")) as mock_pdf:
        await generate_document_pdf("sla", {"effectiveDate": "2025-01-01"})
    html_arg = mock_pdf.call_args[0][0]
    assert "<!DOCTYPE html>" in html_arg
