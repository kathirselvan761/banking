import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent.parent
load_dotenv(os.path.join(BASE_DIR, ".env"))

class Settings:
    PROJECT_NAME: str = "Banking AI Early Warning & Decision Intelligence System"
    VERSION: str = "2.0.0"
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "5000"))
    ENV: str = os.getenv("ENV", "development")
    
    # MongoDB Configuration
    MONGO_URI: str = os.getenv("MONGO_URI", "mongodb://127.0.0.1:27017")
    DB_NAME: str = os.getenv("DB_NAME", "banking_ai")
    
    # Client CORS Configuration
    CLIENT_URL: str = os.getenv("CLIENT_URL", "http://localhost:5173")
    
    # Model Weights Storage
    MODEL_DIR: str = os.path.join(BASE_DIR, "app", "ml", "saved_models")

settings = Settings()
