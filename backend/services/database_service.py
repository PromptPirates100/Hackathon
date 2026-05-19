import os
from motor.motor_asyncio import AsyncIOMotorClient
from utils.logger import setup_logger

logger = setup_logger(__name__)

class DatabaseService:
    client: AsyncIOMotorClient = None
    db = None

    @classmethod
    async def initialize(cls):
        uri = os.getenv("MONGODB_URI")
        db_name = os.getenv("MONGODB_DB_NAME", "pulsegrid")
        if not uri:
            raise ValueError("MONGODB_URI not set")
        cls.client = AsyncIOMotorClient(uri)
        cls.db = cls.client[db_name]
        await cls.db["patients"].create_index("patient_id", unique=True)
        await cls.db["alerts"].create_index("timestamp")
        logger.info("Database connected and indexed")

    @classmethod
    def get_collection(cls, name: str):
        if cls.db is None:
            raise RuntimeError("Database not initialized")
        return cls.db[name]

    @classmethod
    async def close(cls):
        if cls.client:
            cls.client.close()