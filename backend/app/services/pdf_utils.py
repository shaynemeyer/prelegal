"""PDF generation using headless Chromium via Playwright."""
from playwright.async_api import async_playwright


async def html_to_pdf(html: str) -> bytes:
    """Render an HTML string to PDF bytes using a headless Chromium browser."""
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        await page.set_content(html, wait_until="load")
        pdf_bytes = await page.pdf(
            format="Letter",
            margin={"top": "1in", "right": "1.25in", "bottom": "1in", "left": "1.25in"},
            print_background=True,
        )
        await browser.close()
    return pdf_bytes
