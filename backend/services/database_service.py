import os
import ssl
import time
import uuid
from motor.motor_asyncio import AsyncIOMotorClient
from utils.logger import setup_logger

logger = setup_logger(__name__)

# ── In-memory fallback store (used when MongoDB is unavailable) ────────
_memory_store: dict[str, list] = {
    "patients": [],
    "alerts":   [],
}

class _MemoryCollection:
    """Minimal Motor-compatible async collection backed by a Python list."""
    def __init__(self, name: str):
        self._name = name

    @property
    def _data(self):
        return _memory_store[self._name]

    async def insert_one(self, doc: dict):
        doc = dict(doc)
        doc.setdefault("_id", str(uuid.uuid4()))
        self._data.append(doc)
        return doc

    async def replace_one(self, filt: dict, doc: dict, upsert=False):
        for i, row in enumerate(self._data):
            if all(row.get(k) == v for k, v in filt.items()):
                self._data[i] = doc
                return
        if upsert:
            doc.setdefault("_id", str(uuid.uuid4()))
            self._data.append(doc)

    def find(self, filt: dict = None, **kwargs):
        return _MemoryCursor(self._data, filt or {})

    async def find_one(self, filt: dict):
        for row in self._data:
            if all(row.get(k) == v for k, v in filt.items()):
                return dict(row)
        return None

    async def count_documents(self, filt: dict):
        return sum(1 for r in self._data if all(r.get(k) == v for k, v in filt.items()))

    def aggregate(self, pipeline):
        return _MemoryAggregateCursor(self._data, pipeline)

    async def create_index(self, *args, **kwargs):
        pass  # no-op for in-memory

class _MemoryCursor:
    def __init__(self, data, filt):
        matched = [r for r in data if all(r.get(k) == v for k, v in filt.items())]
        self._data = matched

    def sort(self, key, direction=-1):
        self._data.sort(key=lambda r: r.get(key, 0), reverse=(direction == -1))
        return self

    def limit(self, n):
        self._data = self._data[:n]
        return self

    async def to_list(self, length=None):
        data = self._data[:length] if length else self._data
        return [dict(r) for r in data]

class _MemoryAggregateCursor:
    def __init__(self, data, pipeline):
        # Only handles simple $match + $group patterns
        self._results = self._run(list(data), pipeline)
        self._idx = 0

    def _run(self, data, pipeline):
        for stage in pipeline:
            if "$match" in stage:
                filt = stage["$match"]
                data = [r for r in data if self._matches(r, filt)]
            elif "$group" in stage:
                groups: dict = {}
                for r in data:
                    key = str(r.get(str(stage["$group"].get("_id", "")).replace("$", ""), ""))
                    groups[key] = groups.get(key, 0) + 1
                data = [{"_id": k, "count": v} for k, v in groups.items()]
            elif "$sort" in stage:
                sort_key = list(stage["$sort"].keys())[0]
                data.sort(key=lambda r: r.get(sort_key, 0))
        return data

    def _matches(self, row, filt):
        for k, v in filt.items():
            if isinstance(v, dict):
                if "$ne" in v and row.get(k) == v["$ne"]: return False
                if "$gte" in v and row.get(k, 0) < v["$gte"]: return False
            elif row.get(k) != v:
                return False
        return True

    def __aiter__(self):
        return self

    async def __anext__(self):
        if self._idx >= len(self._results):
            raise StopAsyncIteration
        doc = self._results[self._idx]
        self._idx += 1
        return doc

# ── Real DatabaseService ────────────────────────────────────────────────
class DatabaseService:
    client: AsyncIOMotorClient = None
    db = None
    _using_memory = False

    @classmethod
    async def initialize(cls):
        uri = os.getenv("MONGODB_URI")
        db_name = os.getenv("MONGODB_DB_NAME", "pulsegrid")
        if not uri:
            raise ValueError("MONGODB_URI not set")

        # Python 3.13 needs tlsAllowInvalidCertificates for Atlas SSL
        cls.client = AsyncIOMotorClient(
            uri,
            tls=True,
            tlsAllowInvalidCertificates=True,
            serverSelectionTimeoutMS=8000,
        )
        cls.db = cls.client[db_name]
        # Trigger actual connection
        await cls.db["patients"].create_index("patient_id", unique=True)
        await cls.db["alerts"].create_index("timestamp")
        cls._using_memory = False
        logger.info(f"MongoDB connected: {db_name}")

    @classmethod
    def get_collection(cls, name: str):
        if cls.db is None or cls._using_memory:
            logger.debug(f"[MemStore] Accessing collection: {name}")
            return _MemoryCollection(name)
        return cls.db[name]

    @classmethod
    def use_memory_fallback(cls):
        cls._using_memory = True
        logger.warning("Switched to in-memory store — data will not persist between restarts")

    @classmethod
    async def close(cls):
        if cls.client:
            cls.client.close()