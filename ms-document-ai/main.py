from fastapi import FastAPI
from contextlib import asynccontextmanager
from app.core.config import settings
from app.core.database import engine, Base
from app.api.routes import router
import logging

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Créer les tables au démarrage
    Base.metadata.create_all(bind=engine)
    logging.info("Tables créées avec succès")
    yield
    logging.info("Arrêt du service")

app = FastAPI(
    title="MS Document AI",
    description="Microservice de traitement intelligent de documents médicaux",
    version="1.0.0",
    lifespan=lifespan
)

app.include_router(router, prefix="/api/v1")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=settings.APP_PORT, reload=True)