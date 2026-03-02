import json

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel

from app.auth import get_current_user
from app.database import get_db
from app.services.document_service import _DOC_NAMES, generate_document_pdf

router = APIRouter(prefix="/api/documents", tags=["documents"])


class DocumentGenerateRequest(BaseModel):
    doc_type: str
    fields: dict


class DocumentSaveRequest(BaseModel):
    doc_type: str
    doc_name: str
    fields: dict


class DocumentRecord(BaseModel):
    id: int
    doc_type: str
    doc_name: str
    fields: dict
    created_at: str


@router.post("/generate-pdf")
async def generate_pdf(data: DocumentGenerateRequest) -> Response:
    """Generate a PDF for any supported non-NDA document type."""
    if data.doc_type not in _DOC_NAMES:
        raise HTTPException(status_code=400, detail=f"Unsupported document type: {data.doc_type}")

    pdf_bytes = await generate_document_pdf(data.doc_type, data.fields)
    doc_name = _DOC_NAMES[data.doc_type].lower().replace(" ", "-")
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={doc_name}.pdf"},
    )


@router.post("", status_code=201)
async def save_document(
    data: DocumentSaveRequest,
    user: dict = Depends(get_current_user),
) -> dict:
    """Save a document record to the user's history."""
    user_id = int(user["sub"])
    async with get_db() as db:
        cursor = await db.execute(
            "INSERT INTO documents (user_id, doc_type, doc_name, fields_json) VALUES (?, ?, ?, ?)",
            (user_id, data.doc_type, data.doc_name, json.dumps(data.fields)),
        )
        await db.commit()
    return {"id": cursor.lastrowid}


@router.get("", response_model=list[DocumentRecord])
async def list_documents(user: dict = Depends(get_current_user)) -> list[DocumentRecord]:
    """Return the current user's document history, newest first."""
    user_id = int(user["sub"])
    async with get_db() as db:
        cursor = await db.execute(
            "SELECT id, doc_type, doc_name, fields_json, created_at FROM documents WHERE user_id = ? ORDER BY created_at DESC",
            (user_id,),
        )
        rows = await cursor.fetchall()
    return [
        DocumentRecord(
            id=row[0],
            doc_type=row[1],
            doc_name=row[2],
            fields=json.loads(row[3]),
            created_at=row[4],
        )
        for row in rows
    ]
