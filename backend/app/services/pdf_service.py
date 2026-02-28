import re
from html import escape
from pathlib import Path
from typing import Literal

import markdown2

from app.config import TEMPLATES_DIR
from app.logger import get_logger

logger = get_logger(__name__)

TEMPLATES_PATH = Path(TEMPLATES_DIR).resolve()


def _load_template(filename: str) -> str:
    path = TEMPLATES_PATH / filename
    return path.read_text(encoding="utf-8")


def _format_mnda_term(term_type: str, years: int | None, context: Literal["cover", "terms"]) -> str:
    if term_type == "expires":
        n = years or 1
        label = f"{n} year{'s' if n != 1 else ''} from Effective Date"
    else:
        label = "Continues until terminated" if context == "cover" else "the date of termination"
    return label


def _format_conf_term(conf_type: str, years: int | None, context: Literal["cover", "terms"]) -> str:
    if conf_type == "perpetuity":
        return "In perpetuity" if context == "cover" else "in perpetuity"
    n = years or 1
    return f"{n} year{'s' if n != 1 else ''} from Effective Date"


def _replace_coverpage_variables(text: str, values: dict[str, str]) -> str:
    """Replace <span class="coverpage_link">VarName</span> with actual values."""
    for var_name, value in values.items():
        pattern = rf'<span class="coverpage_link">{re.escape(var_name)}</span>'
        text = re.sub(pattern, f"<strong>{escape(value)}</strong>", text)
    return text


def _build_cover_page_html(data: object) -> str:
    mnda_term = _format_mnda_term(data.mnda_term_type, data.mnda_term_years, "cover")
    conf_term = _format_conf_term(data.confidentiality_type, data.confidentiality_years, "cover")

    modifications_row = ""
    if data.modifications:
        modifications_row = f"""
        <tr>
          <th>MNDA Modifications</th>
          <td colspan="2">{escape(data.modifications)}</td>
        </tr>"""

    return f"""
    <div class="cover-page">
      <h1>Mutual Non-Disclosure Agreement</h1>
      <p class="intro">
        This Mutual Non-Disclosure Agreement (the "MNDA") consists of: (1) this Cover Page
        ("Cover Page") and (2) the Common Paper Mutual NDA Standard Terms Version 1.0
        ("Standard Terms"). Any modifications of the Standard Terms should be made on the
        Cover Page, which will control over conflicts with the Standard Terms.
      </p>

      <table class="cover-table">
        <tr><th>Purpose</th><td colspan="2">{escape(data.purpose)}</td></tr>
        <tr><th>Effective Date</th><td colspan="2">{escape(data.effective_date)}</td></tr>
        <tr><th>MNDA Term</th><td colspan="2">{escape(mnda_term)}</td></tr>
        <tr><th>Term of Confidentiality</th><td colspan="2">{escape(conf_term)}</td></tr>
        <tr><th>Governing Law</th><td colspan="2">{escape(data.governing_law)}</td></tr>
        <tr><th>Jurisdiction</th><td colspan="2">{escape(data.jurisdiction)}</td></tr>
        {modifications_row}
      </table>

      <p>By signing this Cover Page, each party agrees to enter into this MNDA as of the Effective Date.</p>

      <table class="signature-table">
        <thead>
          <tr><th></th><th>PARTY 1</th><th>PARTY 2</th></tr>
        </thead>
        <tbody>
          <tr><td>Signature</td><td>&nbsp;</td><td>&nbsp;</td></tr>
          <tr><td>Print Name</td><td>{escape(data.party1.print_name)}</td><td>{escape(data.party2.print_name)}</td></tr>
          <tr><td>Title</td><td>{escape(data.party1.title)}</td><td>{escape(data.party2.title)}</td></tr>
          <tr><td>Company</td><td>{escape(data.party1.company)}</td><td>{escape(data.party2.company)}</td></tr>
          <tr><td>Notice Address</td><td>{escape(data.party1.notice_address)}</td><td>{escape(data.party2.notice_address)}</td></tr>
          <tr><td>Date</td><td>{escape(data.party1.date)}</td><td>{escape(data.party2.date)}</td></tr>
        </tbody>
      </table>

      <p class="attribution">
        Common Paper Mutual Non-Disclosure Agreement (Version 1.0)
        free to use under CC BY 4.0.
      </p>
    </div>
    <div class="page-break"></div>
    """


def _build_standard_terms_html(data: object) -> str:
    variable_map = {
        "Purpose": data.purpose,
        "Effective Date": data.effective_date,
        "MNDA Term": _format_mnda_term(data.mnda_term_type, data.mnda_term_years, "terms"),
        "Term of Confidentiality": _format_conf_term(data.confidentiality_type, data.confidentiality_years, "terms"),
        "Governing Law": data.governing_law,
        "Jurisdiction": data.jurisdiction,
    }

    raw_md = _load_template("Mutual-NDA.md")
    terms_with_vars = _replace_coverpage_variables(raw_md, variable_map)
    return markdown2.markdown(terms_with_vars, extras=["tables"])


def _build_full_html(cover_html: str, terms_html: str) -> str:
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    @page {{
      size: letter;
      margin: 1in 1.25in;
    }}
    body {{
      font-family: Georgia, "Times New Roman", serif;
      font-size: 11pt;
      line-height: 1.6;
      color: #1a1a1a;
    }}
    h1 {{
      font-size: 16pt;
      text-align: center;
      margin-bottom: 0.5em;
      border-bottom: 2px solid #1a1a1a;
      padding-bottom: 0.3em;
    }}
    h2 {{ font-size: 12pt; margin-top: 1.5em; }}
    .intro {{ font-size: 10pt; margin: 1em 0; }}
    .cover-table, .signature-table {{
      width: 100%;
      border-collapse: collapse;
      margin: 1.5em 0;
      font-size: 10.5pt;
    }}
    .cover-table th, .cover-table td,
    .signature-table th, .signature-table td {{
      border: 1px solid #555;
      padding: 0.5em 0.75em;
      vertical-align: top;
    }}
    .cover-table th {{
      background: #f0f0f0;
      font-weight: bold;
      width: 30%;
      text-align: left;
    }}
    .signature-table th {{ background: #f0f0f0; font-weight: bold; text-align: center; }}
    .signature-table td:first-child {{ font-weight: bold; background: #f8f8f8; width: 20%; }}
    .page-break {{ page-break-after: always; }}
    .attribution {{ font-size: 9pt; color: #555; margin-top: 2em; border-top: 1px solid #ccc; padding-top: 0.5em; }}
    ol {{ padding-left: 1.5em; }}
    ol li {{ margin-bottom: 0.5em; }}
    strong {{ font-weight: bold; }}
  </style>
</head>
<body>
  {cover_html}
  <h2 style="text-align:center; margin-top:0;">Standard Terms</h2>
  {terms_html}
</body>
</html>"""


async def generate_nda_pdf(data: object) -> bytes:
    logger.info("Generating NDA PDF", party1=data.party1.company, party2=data.party2.company)

    from weasyprint import HTML

    cover_html = _build_cover_page_html(data)
    terms_html = _build_standard_terms_html(data)
    full_html = _build_full_html(cover_html, terms_html)

    pdf_bytes = HTML(string=full_html).write_pdf()
    logger.info("PDF generated successfully")
    return pdf_bytes
