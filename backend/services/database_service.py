import os
import ssl
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

        # Python 3.13 has stricter TLS defaults that break older MongoDB Atlas SSL.
        # Creating a permissive SSL context resolves TLSV1_ALERT_INTERNAL_ERROR.
        ssl_ctx = ssl.create_default_context()
        ssl_ctx.check_hostname = False
        ssl_ctx.verify_mode = ssl.CERT_NONE

        cls.client = AsyncIOMotorClient(
            uri,
            tls=True,
            tlsAllowInvalidCertificates=True,
            serverSelectionTimeoutMS=10000,
        )
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