import os
from dotenv import load_dotenv

# Load environment variables from .env if present
load_dotenv()

class Settings:
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    ENV: str = os.getenv("ENV", "development")
    BACKEND_URL: str = os.getenv("BACKEND_URL", "http://localhost:5000/api")
    MODEL_STORAGE_PATH: str = os.getenv("MODEL_STORAGE_PATH", "./models/weights")

settings = Settings()
