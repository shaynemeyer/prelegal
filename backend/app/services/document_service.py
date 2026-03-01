"""Generic document PDF generation for non-NDA document types."""
from html import escape
from pathlib import Path

import markdown2

from app.config import TEMPLATES_DIR
from app.logger import get_logger

logger = get_logger(__name__)

TEMPLATES_PATH = Path(TEMPLATES_DIR).resolve()

# Map doc_type slug → template filename
_TEMPLATE_MAP: dict[str, str] = {
    "csa": "CSA.md",
    "sla": "sla.md",
    "design-partner": "design-partner-agreement.md",
    "psa": "psa.md",
    "dpa": "DPA.md",
    "partnership": "Partnership-Agreement.md",
    "software-license": "Software-License-Agreement.md",
    "pilot": "Pilot-Agreement.md",
    "baa": "BAA.md",
    "ai-addendum": "AI-Addendum.md",
}

# Human-readable names for each doc type
_DOC_NAMES: dict[str, str] = {
    "csa": "Cloud Service Agreement",
    "sla": "Service Level Agreement",
    "design-partner": "Design Partner Agreement",
    "psa": "Professional Services Agreement",
    "dpa": "Data Processing Agreement",
    "partnership": "Partnership Agreement",
    "software-license": "Software License Agreement",
    "pilot": "Pilot Agreement",
    "baa": "Business Associate Agreement",
    "ai-addendum": "AI Addendum",
}

# Fields to render in the cover page table (in order), per doc type
_COVER_FIELDS: dict[str, list[str]] = {
    "csa": ["effectiveDate", "subscriptionPeriod", "governingLaw", "jurisdiction", "modifications"],
    "sla": ["effectiveDate", "targetUptime", "targetResponseTime", "supportChannel", "governingLaw", "jurisdiction", "modifications"],
    "design-partner": ["effectiveDate", "programDuration", "programScope", "governingLaw", "jurisdiction", "modifications"],
    "psa": ["effectiveDate", "projectDescription", "paymentTerms", "governingLaw", "jurisdiction", "modifications"],
    "dpa": ["effectiveDate", "dataTypes", "processingPurpose", "governingLaw", "jurisdiction", "modifications"],
    "partnership": ["effectiveDate", "partnershipPurpose", "revenueSplit", "governingLaw", "jurisdiction", "modifications"],
    "software-license": ["effectiveDate", "softwareName", "licenseType", "licenseFees", "governingLaw", "jurisdiction", "modifications"],
    "pilot": ["effectiveDate", "pilotDuration", "pilotScope", "pilotFees", "governingLaw", "jurisdiction", "modifications"],
    "baa": ["effectiveDate", "phiScope", "servicesDescription", "governingLaw", "jurisdiction", "modifications"],
    "ai-addendum": ["effectiveDate", "aiSystemName", "trainingPermissions", "outputOwnership", "governingLaw", "jurisdiction", "modifications"],
}

# Party field names per doc type (party1_key, party2_key, party1_label, party2_label)
_PARTY_KEYS: dict[str, tuple[str, str, str, str]] = {
    "csa": ("provider", "customer", "Provider", "Customer"),
    "sla": ("provider", "customer", "Provider", "Customer"),
    "design-partner": ("provider", "designPartner", "Provider", "Design Partner"),
    "psa": ("provider", "customer", "Provider", "Customer"),
    "dpa": ("controller", "processor", "Controller", "Processor"),
    "partnership": ("partner1", "partner2", "Partner 1", "Partner 2"),
    "software-license": ("provider", "customer", "Provider", "Customer"),
    "pilot": ("provider", "customer", "Provider", "Customer"),
    "baa": ("coveredEntity", "businessAssociate", "Covered Entity", "Business Associate"),
    "ai-addendum": ("provider", "customer", "Provider", "Customer"),
}

_FIELD_LABELS: dict[str, str] = {
    "effectiveDate": "Effective Date",
    "subscriptionPeriod": "Subscription Period",
    "targetUptime": "Target Uptime",
    "targetResponseTime": "Target Response Time",
    "supportChannel": "Support Channel",
    "programDuration": "Program Duration",
    "programScope": "Program Scope",
    "projectDescription": "Project Description",
    "paymentTerms": "Payment Terms",
    "dataTypes": "Data Types",
    "processingPurpose": "Processing Purpose",
    "partnershipPurpose": "Partnership Purpose",
    "revenueSplit": "Revenue Split",
    "softwareName": "Software Name",
    "licenseType": "License Type",
    "licenseFees": "License Fees",
    "pilotDuration": "Pilot Duration",
    "pilotScope": "Pilot Scope",
    "pilotFees": "Pilot Fees",
    "phiScope": "PHI Scope",
    "servicesDescription": "Services Description",
    "aiSystemName": "AI System",
    "trainingPermissions": "Training Permissions",
    "outputOwnership": "Output Ownership",
    "governingLaw": "Governing Law",
    "jurisdiction": "Jurisdiction",
    "modifications": "Modifications",
}


def _load_template(filename: str) -> str:
    path = TEMPLATES_PATH / filename
    return path.read_text(encoding="utf-8")


def _build_generic_cover_html(doc_type: str, fields: dict) -> str:
    doc_name = _DOC_NAMES.get(doc_type, doc_type)
    field_keys = _COVER_FIELDS.get(doc_type, [])
    party_keys = _PARTY_KEYS.get(doc_type, ("party1", "party2", "Party 1", "Party 2"))
    p1_key, p2_key, p1_label, p2_label = party_keys

    rows = ""
    for key in field_keys:
        value = fields.get(key)
        if value:
            label = _FIELD_LABELS.get(key, key)
            rows += f"<tr><th>{escape(label)}</th><td colspan='2'>{escape(str(value))}</td></tr>"

    party1 = fields.get(p1_key) or {}
    party2 = fields.get(p2_key) or {}

    def _party_cell(party: dict, field: str) -> str:
        return escape(str(party.get(field, "")))

    return f"""
    <div class="cover-page">
      <h1>{escape(doc_name)}</h1>
      <p class="intro">
        This {escape(doc_name)} consists of this Cover Page and the Common Paper Standard Terms.
        Any modifications to the Standard Terms should be made on the Cover Page.
      </p>

      <table class="cover-table">
        {rows}
      </table>

      <p>By signing this Cover Page, each party agrees to enter into this Agreement as of the Effective Date.</p>

      <table class="signature-table">
        <thead>
          <tr><th></th><th>{escape(p1_label)}</th><th>{escape(p2_label)}</th></tr>
        </thead>
        <tbody>
          <tr><td>Signature</td><td>&nbsp;</td><td>&nbsp;</td></tr>
          <tr><td>Print Name</td><td>{_party_cell(party1, "printName")}</td><td>{_party_cell(party2, "printName")}</td></tr>
          <tr><td>Title</td><td>{_party_cell(party1, "title")}</td><td>{_party_cell(party2, "title")}</td></tr>
          <tr><td>Company</td><td>{_party_cell(party1, "company")}</td><td>{_party_cell(party2, "company")}</td></tr>
          <tr><td>Notice Address</td><td>{_party_cell(party1, "noticeAddress")}</td><td>{_party_cell(party2, "noticeAddress")}</td></tr>
        </tbody>
      </table>

      <p class="attribution">
        Common Paper Standard Terms free to use under CC BY 4.0.
      </p>
    </div>
    <div class="page-break"></div>
    """


def _build_standard_terms_html(template_file: str) -> str:
    raw_md = _load_template(template_file)
    return markdown2.markdown(raw_md, extras=["tables"])


def _build_full_html(cover_html: str, terms_html: str, doc_name: str) -> str:
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


async def generate_document_pdf(doc_type: str, fields: dict) -> bytes:
    """Generate a PDF for any supported document type (non-NDA)."""
    template_file = _TEMPLATE_MAP.get(doc_type)
    if not template_file:
        raise ValueError(f"Unsupported document type: {doc_type}")

    doc_name = _DOC_NAMES.get(doc_type, doc_type)
    logger.info("Generating document PDF", doc_type=doc_type)

    from app.services.pdf_utils import html_to_pdf

    cover_html = _build_generic_cover_html(doc_type, fields)
    terms_html = _build_standard_terms_html(template_file)
    full_html = _build_full_html(cover_html, terms_html, doc_name)

    pdf_bytes = await html_to_pdf(full_html)
    logger.info("PDF generated successfully", doc_type=doc_type)
    return pdf_bytes
