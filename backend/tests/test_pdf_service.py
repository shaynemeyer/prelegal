"""Unit tests for pdf_service helpers — no WeasyPrint required."""

import pytest

from app.routes.nda import NdaFormData, PartyInfo
from app.services.pdf_service import (
    _build_cover_page_html,
    _build_full_html,
    _build_standard_terms_html,
    _format_conf_term,
    _format_mnda_term,
    _load_template,
    _replace_coverpage_variables,
)


def _party(n: int) -> PartyInfo:
    return PartyInfo(
        print_name=f"Person {n}",
        title="CEO" if n == 1 else "CTO",
        company=f"Company {n}",
        notice_address=f"{n} Main St",
        date="2025-01-01",
    )


def _data(**overrides) -> NdaFormData:
    defaults = dict(
        purpose="Partnership evaluation",
        effective_date="2025-01-01",
        mnda_term_type="expires",
        mnda_term_years=2,
        confidentiality_type="years",
        confidentiality_years=3,
        governing_law="California",
        jurisdiction="San Francisco County",
        modifications=None,
        party1=_party(1),
        party2=_party(2),
    )
    defaults.update(overrides)
    return NdaFormData(**defaults)


# ── _format_mnda_term ────────────────────────────────────────────────────────


def test_mnda_term_expires_singular():
    assert _format_mnda_term("expires", 1, "cover") == "1 year from Effective Date"


def test_mnda_term_expires_plural():
    assert _format_mnda_term("expires", 3, "cover") == "3 years from Effective Date"


def test_mnda_term_expires_none_defaults_to_one():
    assert _format_mnda_term("expires", None, "cover") == "1 year from Effective Date"


def test_mnda_term_continues_cover():
    assert _format_mnda_term("continues", None, "cover") == "Continues until terminated"


def test_mnda_term_continues_terms():
    assert _format_mnda_term("continues", None, "terms") == "the date of termination"


# ── _format_conf_term ────────────────────────────────────────────────────────


def test_conf_term_perpetuity_cover():
    assert _format_conf_term("perpetuity", None, "cover") == "In perpetuity"


def test_conf_term_perpetuity_terms():
    assert _format_conf_term("perpetuity", None, "terms") == "in perpetuity"


def test_conf_term_years_singular():
    assert _format_conf_term("years", 1, "cover") == "1 year from Effective Date"


def test_conf_term_years_plural():
    assert _format_conf_term("years", 5, "cover") == "5 years from Effective Date"


def test_conf_term_years_none_defaults_to_one():
    assert _format_conf_term("years", None, "cover") == "1 year from Effective Date"


# ── _replace_coverpage_variables ─────────────────────────────────────────────


def test_replace_variable_substitutes_value():
    text = '<span class="coverpage_link">Purpose</span>'
    result = _replace_coverpage_variables(text, {"Purpose": "Evaluating partnership"})
    assert "<strong>Evaluating partnership</strong>" in result


def test_replace_variable_html_escapes_value():
    text = '<span class="coverpage_link">Purpose</span>'
    result = _replace_coverpage_variables(text, {"Purpose": "<script>alert(1)</script>"})
    assert "<script>" not in result
    assert "&lt;script&gt;" in result


def test_replace_variable_no_match_leaves_text_unchanged():
    text = "No spans here."
    result = _replace_coverpage_variables(text, {"Purpose": "anything"})
    assert result == text


def test_replace_variable_multiple_variables():
    text = (
        '<span class="coverpage_link">Purpose</span> '
        '<span class="coverpage_link">Governing Law</span>'
    )
    result = _replace_coverpage_variables(
        text, {"Purpose": "Test", "Governing Law": "Delaware"}
    )
    assert "<strong>Test</strong>" in result
    assert "<strong>Delaware</strong>" in result


# ── _build_cover_page_html ───────────────────────────────────────────────────


def test_cover_page_contains_party_names():
    html = _build_cover_page_html(_data())
    assert "Person 1" in html
    assert "Person 2" in html


def test_cover_page_contains_companies():
    html = _build_cover_page_html(_data())
    assert "Company 1" in html
    assert "Company 2" in html


def test_cover_page_contains_purpose():
    html = _build_cover_page_html(_data(purpose="Custom purpose text"))
    assert "Custom purpose text" in html


def test_cover_page_contains_governing_law():
    html = _build_cover_page_html(_data())
    assert "California" in html


def test_cover_page_modifications_row_present_when_set():
    html = _build_cover_page_html(_data(modifications="Clause 5 is amended."))
    assert "MNDA Modifications" in html
    assert "Clause 5 is amended." in html


def test_cover_page_modifications_row_absent_when_none():
    html = _build_cover_page_html(_data(modifications=None))
    assert "MNDA Modifications" not in html


def test_cover_page_modifications_row_absent_when_empty():
    html = _build_cover_page_html(_data(modifications=""))
    assert "MNDA Modifications" not in html


def test_cover_page_html_escapes_user_input():
    html = _build_cover_page_html(_data(purpose="<b>bold</b>"))
    assert "<b>bold</b>" not in html
    assert "&lt;b&gt;" in html


# ── _build_full_html ─────────────────────────────────────────────────────────


def test_full_html_is_valid_document():
    html = _build_full_html("<p>cover</p>", "<p>terms</p>")
    assert html.startswith("<!DOCTYPE html>")
    assert "<html" in html
    assert "</html>" in html


def test_full_html_contains_cover_and_terms():
    html = _build_full_html("<p>cover content</p>", "<p>terms content</p>")
    assert "cover content" in html
    assert "terms content" in html


# ── _load_template ───────────────────────────────────────────────────────────


def test_load_template_returns_nonempty_string():
    content = _load_template("Mutual-NDA.md")
    assert isinstance(content, str)
    assert len(content) > 100


def test_load_template_missing_file_raises():
    with pytest.raises(FileNotFoundError):
        _load_template("nonexistent-file.md")


# ── _build_standard_terms_html ───────────────────────────────────────────────


def test_standard_terms_html_contains_injected_governing_law():
    html = _build_standard_terms_html(_data(governing_law="Delaware"))
    assert "<strong>Delaware</strong>" in html


def test_standard_terms_html_returns_html_string():
    html = _build_standard_terms_html(_data())
    assert "<" in html and ">" in html
