import pytesseract
import cv2
import numpy as np
from PIL import Image
from pdf2image import convert_from_path
from pathlib import Path
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

# Configuration Tesseract
pytesseract.pytesseract.tesseract_cmd = settings.TESSERACT_CMD

class OCRService:

    def preprocess_image(self, image: np.ndarray) -> np.ndarray:
        """Prétraitement de l'image pour améliorer l'OCR"""
        # Conversion en niveaux de gris
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        # Débruitage
        denoised = cv2.fastNlMeansDenoising(gray, h=10)
        # Binarisation adaptative
        binary = cv2.adaptiveThreshold(
            denoised, 255,
            cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
            cv2.THRESH_BINARY, 11, 2
        )
        return binary

    def extract_from_image(self, image_path: str) -> dict:
        """Extraire le texte d'une image"""
        try:
            image = cv2.imread(image_path)
            if image is None:
                raise ValueError(f"Impossible de lire l'image: {image_path}")

            processed = self.preprocess_image(image)

            # OCR avec config optimisée
            config = "--oem 3 --psm 6"
            data = pytesseract.image_to_data(
                processed,
                lang="fra+ara",
                config=config,
                output_type=pytesseract.Output.DICT
            )

            # Calcul du score de confiance
            confidences = [int(c) for c in data['conf'] if int(c) > 0]
            score = sum(confidences) / len(confidences) if confidences else 0.0

            # Extraction du texte
            texte = pytesseract.image_to_string(
                processed, lang="fra+ara", config=config
            )

            return {
                "texte": texte.strip(),
                "score_confiance": round(score / 100, 2),
                "langue": "fr"
            }

        except Exception as e:
            logger.error(f"Erreur OCR image: {e}")
            return {"texte": "", "score_confiance": 0.0, "langue": "fr"}

    def extract_from_pdf(self, pdf_path: str) -> dict:
        """Extraire le texte d'un PDF"""
        try:
            pages = convert_from_path(
                pdf_path,
                poppler_path=settings.POPPLER_PATH,
                dpi=300
            )

            textes = []
            scores = []

            for page in pages:
                image = cv2.cvtColor(np.array(page), cv2.COLOR_RGB2BGR)
                processed = self.preprocess_image(image)

                config = "--oem 3 --psm 6"
                data = pytesseract.image_to_data(
                    processed,
                    lang="fra+ara",
                    config=config,
                    output_type=pytesseract.Output.DICT
                )

                confidences = [int(c) for c in data['conf'] if int(c) > 0]
                score = sum(confidences) / len(confidences) if confidences else 0.0
                scores.append(score)

                texte = pytesseract.image_to_string(
                    processed, lang="fra+ara", config=config
                )
                textes.append(texte.strip())

            return {
                "texte": "\n\n".join(textes),
                "score_confiance": round(sum(scores) / len(scores) / 100, 2) if scores else 0.0,
                "langue": "fr"
            }

        except Exception as e:
            logger.error(f"Erreur OCR PDF: {e}")
            return {"texte": "", "score_confiance": 0.0, "langue": "fr"}

    def extract(self, file_path: str) -> dict:
        """Point d'entrée principal — détecte automatiquement le type"""
        path = Path(file_path)
        extension = path.suffix.lower()

        if extension == ".pdf":
            return self.extract_from_pdf(file_path)
        elif extension in [".jpg", ".jpeg", ".png", ".tiff", ".bmp"]:
            return self.extract_from_image(file_path)
        else:
            raise ValueError(f"Format non supporté: {extension}")

ocr_service = OCRService()