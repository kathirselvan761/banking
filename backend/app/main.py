import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config.settings import settings
from app.database.mongodb import connect_to_mongo, close_mongo_connection, get_db

# Import routers
from app.routes.ingestion import router as ingestion_router
from app.routes.customers import router as customers_router
from app.routes.transactions import router as transactions_router
from app.routes.complaints import router as complaints_router
from app.routes.risk import router as risk_router
from app.routes.investigation import router as investigation_router
from app.routes.what_if import router as what_if_router
from app.routes.alerts import router as alerts_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] [%(levelname)s] [%(name)s] %(message)s"
)
logger = logging.getLogger("banking_ai")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing Banking AI Early Warning & Decision Intelligence System...")
    connect_to_mongo()
    yield
    close_mongo_connection()
    logger.info("Backend shutdown complete.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="End-to-End Banking Early Warning & Decision Intelligence Platform with Ingestion, Validation, NLP, ML, and LangGraph Agentic Loop.",
    version=settings.VERSION,
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(ingestion_router)
app.include_router(customers_router)
app.include_router(transactions_router)
app.include_router(complaints_router)
app.include_router(risk_router)
app.include_router(investigation_router)
app.include_router(what_if_router)
app.include_router(alerts_router)

@app.get("/api/health", tags=["Health"])
async def health_check():
    """System Health Endpoint."""
    db = get_db()
    mongo_status = "connected" if db is not None else "disconnected"
    return {
        "status": "healthy",
        "service": "banking-ai-decision-intelligence",
        "version": settings.VERSION,
        "environment": settings.ENV,
        "system": {
            "mongodb": mongo_status,
            "fastapi": "running",
            "langgraph_agent_loop": "active",
            "whisper_stt": "available",
            "finbert_sentiment": "available",
            "sbert_clustering": "available",
            "xgboost_risk": "available",
            "shap_explainability": "available",
            "isolation_forest": "available",
            "kmeans_segmentation": "available"
        }
    }

@app.get("/", tags=["Health"])
async def root():
    return {
        "message": "Banking AI Early Warning & Decision Intelligence Platform API is active.",
        "docs": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
