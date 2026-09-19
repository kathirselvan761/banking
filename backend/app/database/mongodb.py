import logging
from pymongo import MongoClient, ASCENDING
from app.config.settings import settings

logger = logging.getLogger("banking_ai.database")

class Database:
    client: MongoClient = None
    db = None

db_instance = Database()

def connect_to_mongo():
    try:
        db_instance.client = MongoClient(settings.MONGO_URI, serverSelectionTimeoutMS=3000)
        # Verify connection
        db_instance.client.admin.command('ping')
        db_instance.db = db_instance.client[settings.DB_NAME]
        logger.info(f"Connected to MongoDB successfully at {settings.MONGO_URI} [DB: {settings.DB_NAME}]")
        init_indexes()
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB: {e}")

def close_mongo_connection():
    if db_instance.client:
        db_instance.client.close()
        logger.info("MongoDB connection closed.")

def get_db():
    if db_instance.db is None:
        connect_to_mongo()
    return db_instance.db

def get_collection(name: str):
    db = get_db()
    return db[name]

def init_indexes():
    """Ensure customer_id indexes on key collections."""
    try:
        db = db_instance.db
        collections_with_customer_id = [
            "customers", "transactions", "complaints", "loan_records",
            "voice_records", "system_events", "risk_profiles", "alerts",
            "investigations", "embeddings"
        ]
        for col_name in collections_with_customer_id:
            col = db[col_name]
            col.create_index([("customer_id", ASCENDING)], background=True)
        # Extra useful indexes
        db["transactions"].create_index([("timestamp", ASCENDING)], background=True)
        db["complaints"].create_index([("createdAt", ASCENDING)], background=True)
        db["alerts"].create_index([("severity", ASCENDING)], background=True)
        logger.info("MongoDB collection indexes initialized successfully.")
    except Exception as e:
        logger.warning(f"Could not initialize indexes: {e}")
