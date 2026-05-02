from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.document import TypeDocument
from app.schemas.document import DocumentCreate, DocumentResponse, DocumentListResponse
from app.services.document_service import document_service
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/documents/upload", response_model=DocumentResponse)
async def upload_document(
    file: UploadFile = File(...),
    type_document: TypeDocument = Form(...),
    patient_id: int = Form(None),
    medecin_id: int = Form(None),
    traitement_auto: bool = Form(True),
    db: Session = Depends(get_db)
):
    """Uploader et traiter un document médical"""
    max_size = 10 * 1024 * 1024
    content = await file.read()

    if len(content) > max_size:
        raise HTTPException(status_code=400, detail="Fichier trop volumineux (max 10MB)")

    allowed_types = ["application/pdf", "image/jpeg", "image/png", "image/tiff"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Type de fichier non supporté")

    data = DocumentCreate(
        type_document=type_document,
        patient_id=patient_id,
        medecin_id=medecin_id,
        traitement_auto=traitement_auto
    )

    document = document_service.create_document(db, content, file.filename, data)
    return document


@router.get("/documents", response_model=DocumentListResponse)
def list_documents(
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    """Lister tous les documents"""
    total, documents = document_service.get_all_documents(db, skip, limit)
    return {"total": total, "documents": documents}


@router.get("/documents/{document_id}", response_model=DocumentResponse)
def get_document(document_id: int, db: Session = Depends(get_db)):
    """Récupérer un document par ID"""
    document = document_service.get_document(db, document_id)
    if not document:
        raise HTTPException(status_code=404, detail="Document non trouvé")
    return document


@router.get("/documents/patient/{patient_id}", response_model=list[DocumentResponse])
def get_documents_by_patient(patient_id: int, db: Session = Depends(get_db)):
    """Récupérer les documents d'un patient"""
    return document_service.get_documents_by_patient(db, patient_id)


@router.post("/documents/{document_id}/retraiter", response_model=DocumentResponse)
def retraiter_document(document_id: int, db: Session = Depends(get_db)):
    """Relancer le traitement OCR+NLP sur un document"""
    document = document_service.get_document(db, document_id)
    if not document:
        raise HTTPException(status_code=404, detail="Document non trouvé")
    document_service.traiter_document(db, document)
    return document


@router.delete("/documents/{document_id}")
def delete_document(document_id: int, db: Session = Depends(get_db)):
    """Supprimer un document"""
    success = document_service.delete_document(db, document_id)
    if not success:
        raise HTTPException(status_code=404, detail="Document non trouvé")
    return {"message": "Document supprimé avec succès"}


@router.get("/health")
def health_check():
    return {"status": "ok", "service": "ms-document-ai"}