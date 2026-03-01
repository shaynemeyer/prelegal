"""Unit tests for html_to_pdf — Playwright browser is fully mocked."""
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from app.services.pdf_utils import html_to_pdf


def _make_mocks():
    page = AsyncMock()
    page.pdf = AsyncMock(return_value=b"%PDF-fake")

    browser = AsyncMock()
    browser.new_page = AsyncMock(return_value=page)

    pw = MagicMock()
    pw.chromium.launch = AsyncMock(return_value=browser)

    cm = AsyncMock()
    cm.__aenter__ = AsyncMock(return_value=pw)
    cm.__aexit__ = AsyncMock(return_value=None)

    return cm, browser, page


@pytest.mark.asyncio
async def test_html_to_pdf_returns_pdf_bytes():
    cm, _, _ = _make_mocks()
    with patch("app.services.pdf_utils.async_playwright", return_value=cm):
        result = await html_to_pdf("<html>test</html>")
    assert result == b"%PDF-fake"


@pytest.mark.asyncio
async def test_html_to_pdf_passes_html_to_page():
    cm, _, page = _make_mocks()
    with patch("app.services.pdf_utils.async_playwright", return_value=cm):
        await html_to_pdf("<html>hello</html>")
    page.set_content.assert_awaited_once_with("<html>hello</html>", wait_until="load")


@pytest.mark.asyncio
async def test_html_to_pdf_closes_browser():
    cm, browser, _ = _make_mocks()
    with patch("app.services.pdf_utils.async_playwright", return_value=cm):
        await html_to_pdf("<html>test</html>")
    browser.close.assert_awaited_once()
