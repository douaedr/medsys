import os
import json
import shutil
import uuid
from datetime import datetime
from pathlib import Path
from sqlalchemy.orm import Session
from app.models.document import Document, StatutTraitement
from app.schemas.document import DocumentCreate
from app.services.ocr_service import ocr_service
from app.services.nlp_service import nlp_service
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

class DocumentService:

    def save_file(self, file_content: bytes, filename: str) -> tuple[str, str]:
        """Sauvegarder le fichier uploadé"""
        upload_dir = Path(settings.UPLOAD_DIR)
        upload_dir.mkdir(exist_ok=True)

        extension = Path(filename).suffix
        unique_name = f"{uuid.uuid4()}{extension}"
        file_path = upload_dir / unique_name

        with open(file_path, "wb") as f:
            f.write(file_content)

        return str(file_path), unique_name

    def create_document(self, db: Session, file_content: bytes,
                        filename: str, data: DocumentCreate) -> Document:
        """Créer un document et lancer le traitement"""
        file_path, unique_name = self.save_file(file_content, filename)

        document = Document(
            nom_fichier=unique_name,
            nom_original=filename,
            type_document=data.type_document,
            chemin_fichier=file_path,
            taille_fichier=len(file_content),
            mime_type=self._get_mime_type(filename),
            patient_id=data.patient_id,
            medecin_id=data.medecin_id,
            traitement_auto=data.traitement_auto,
            statut=StatutTraitement.EN_ATTENTE
        )

        db.add(document)
        db.commit()
        db.refresh(document)

        if data.traitement_auto:
            self.traiter_document(db, document)

        return document

    def traiter_document(self, db: Session, document: Document):
        """Lancer OCR + NLP sur le document"""
        try:
            document.statut = StatutTraitement.EN_COURS
            db.commit()

            # OCR
            ocr_result = ocr_service.extract(document.chemin_fichier)
            document.texte_extrait = ocr_result["texte"]
            document.score_confiance = ocr_result["score_confiance"]
            document.langue_detectee = ocr_result["langue"]

            # NLP
            if ocr_result["texte"]:
                nlp_result = nlp_service.analyser(
                    ocr_result["texte"],
                    document.type_document
                )
                document.entites_extraites = json.dumps(nlp_result["entites"], ensure_ascii=False)
                document.mots_cles = json.dumps(nlp_result["mots_cles"], ensure_ascii=False)
                document.resume = nlp_result["resume"]

            document.statut = StatutTraitement.TERMINE
            document.traite_at = datetime.utcnow()

        except Exception as e:
            logger.error(f"Erreur traitement document {document.id}: {e}")
            document.statut = StatutTraitement.ECHEC
            document.message_erreur = str(e)

        finally:
            db.commit()
            db.refresh(document)

    def get_document(self, db: Session, document_id: int) -> Document:
        return db.query(Document).filter(Document.id == document_id).first()

    def get_all_documents(self, db: Session, skip: int = 0,
                          limit: int = 20) -> tuple[int, list[Document]]:
        total = db.query(Document).count()
        documents = db.query(Document).offset(skip).limit(limit).all()
        return total, documents

    def get_documents_by_patient(self, db: Session,
                                  patient_id: int) -> list[Document]:
        return db.query(Document).filter(
            Document.patient_id == patient_id
        ).all()

    def delete_document(self, db: Session, document_id: int) -> bool:
        document = self.get_document(db, document_id)
        if not document:
            return False
        if os.path.exists(document.chemin_fichier):
            os.remove(document.chemin_fichier)
        db.delete(document)
        db.commit()
        return True

    def _get_mime_type(self, filename: str) -> str:
        extension = Path(filename).suffix.lower()
        mime_types = {
            ".pdf": "application/pdf",
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".png": "image/png",
            ".tiff": "image/tiff",
            ".bmp": "image/bmp"
        }
        return mime_types.get(extension, "application/octet-stream")

document_service = DocumentService()