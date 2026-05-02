from sqlalchemy import Column, Integer, String, Text, DateTime, Enum, Float, Boolean
from sqlalchemy.sql import func
from app.core.database import Base
import enum

class TypeDocument(str, enum.Enum):
    ORDONNANCE = "ORDONNANCE"
    CERTIFICAT = "CERTIFICAT"
    ANALYSE = "ANALYSE"
    RADIOLOGIE = "RADIOLOGIE"
    COMPTE_RENDU = "COMPTE_RENDU"
    AUTRE = "AUTRE"

class StatutTraitement(str, enum.Enum):
    EN_ATTENTE = "EN_ATTENTE"
    EN_COURS = "EN_COURS"
    TERMINE = "TERMINE"
    ECHEC = "ECHEC"

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    nom_fichier = Column(String(255), nullable=False)
    nom_original = Column(String(255), nullable=False)
    type_document = Column(Enum(TypeDocument), nullable=False)
    chemin_fichier = Column(String(500), nullable=False)
    taille_fichier = Column(Integer)
    mime_type = Column(String(100))

    # Données extraites par OCR
    texte_extrait = Column(Text)
    score_confiance = Column(Float)
    langue_detectee = Column(String(10))

    # Données extraites par NLP
    entites_extraites = Column(Text)  # JSON string
    mots_cles = Column(Text)          # JSON string
    resume = Column(Text)

    # Statut
    statut = Column(Enum(StatutTraitement), default=StatutTraitement.EN_ATTENTE)
    message_erreur = Column(Text)

    # Références vers autres microservices
    patient_id = Column(Integer)
    medecin_id = Column(Integer)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    traite_at = Column(DateTime(timezone=True))

    traitement_auto = Column(Boolean, default=True)