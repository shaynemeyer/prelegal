from fastapi import APIRouter
from fastapi.responses import Response
from pydantic import BaseModel

from app.services.document_service import _DOC_NAMES, generate_document_pdf

router = APIRouter(prefix="/api/documents", tags=["documents"])


class DocumentGenerateRequest(BaseModel):
    doc_type: str
    fields: dict


@router.post("/generate-pdf")
async def generate_pdf(data: DocumentGenerateRequest) -> Response:
    """Generate a PDF for any supported non-NDA document type."""
    if data.doc_type not in _DOC_NAMES:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail=f"Unsupported document type: {data.doc_type}")

    pdf_bytes = await generate_document_pdf(data.doc_type, data.fields)
    doc_name = _DOC_NAMES[data.doc_type].lower().replace(" ", "-")
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={doc_name}.pdf"},
    )
