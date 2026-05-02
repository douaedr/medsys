from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.document import TypeDocument, StatutTraitement

class DocumentCreate(BaseModel):
    type_document: TypeDocument
    patient_id: Optional[int] = None
    medecin_id: Optional[int] = None
    traitement_auto: bool = True

class DocumentResponse(BaseModel):
    id: int
    nom_fichier: str
    nom_original: str
    type_document: TypeDocument
    taille_fichier: Optional[int]
    mime_type: Optional[str]
    texte_extrait: Optional[str]
    score_confiance: Optional[float]
    langue_detectee: Optional[str]
    entites_extraites: Optional[str]
    mots_cles: Optional[str]
    resume: Optional[str]
    statut: StatutTraitement
    message_erreur: Optional[str]
    patient_id: Optional[int]
    medecin_id: Optional[int]
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    traite_at: Optional[datetime]
    traitement_auto: bool

    class Config:
        from_attributes = True

class DocumentListResponse(BaseModel):
    total: int
    documents: list[DocumentResponse]

class OCRResult(BaseModel):
    texte: str
    score_confiance: float
    langue: str

class NLPResult(BaseModel):
    entites: dict
    mots_cles: list[str]
    resume: str