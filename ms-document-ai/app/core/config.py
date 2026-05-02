from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    APP_NAME: str = "ms-document-ai"
    APP_PORT: int = 8085
    ENVIRONMENT: str = "development"

    DB_HOST: str = "localhost"
    DB_PORT: int = 3306
    DB_NAME: str = "ms_document_ai"
    DB_USER: str = "root"
    DB_PASSWORD: str = ""

    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"

    TESSERACT_CMD: str = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
    POPPLER_PATH: str = r"C:\Program Files\poppler\Library\bin"

    MS_PATIENT_URL: str = "http://localhost:8081"
    MS_AUTH_URL: str = "http://localhost:8082"

    UPLOAD_DIR: str = "uploads"
    MAX_UPLOAD_SIZE_MB: int = 10

    class Config:
        env_file = ".env"

settings = Settings()