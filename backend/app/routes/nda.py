from typing import Literal

from fastapi import APIRouter
from fastapi.responses import Response
from pydantic import BaseModel

from app.services.pdf_service import generate_nda_pdf

router = APIRouter(prefix="/api/nda", tags=["nda"])


class PartyInfo(BaseModel):
    print_name: str
    title: str
    company: str
    notice_address: str
    date: str


class NdaFormData(BaseModel):
    purpose: str
    effective_date: str
    mnda_term_type: Literal["expires", "continues"]
    mnda_term_years: int | None = None
    confidentiality_type: Literal["years", "perpetuity"]
    confidentiality_years: int | None = None
    governing_law: str
    jurisdiction: str
    modifications: str | None = None
    party1: PartyInfo
    party2: PartyInfo


@router.post("/generate-pdf")
async def generate_pdf(data: NdaFormData) -> Response:
    pdf_bytes = await generate_nda_pdf(data)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=mutual-nda.pdf"},
    )
