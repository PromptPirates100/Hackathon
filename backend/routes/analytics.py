from fastapi import APIRouter
from services.database_service import DatabaseService
from datetime import datetime, timedelta

router = APIRouter()

@router.get("/")
async def get_analytics():
    db = DatabaseService.get_collection("patients")
    active_count = await db.count_documents({"status": "active"})

    pipeline = [
        {"$match": {"status": "active"}},
        {"$group": {"_id": "$triage.severity", "count": {"$sum": 1}}}
    ]
    severity_cursor = db.aggregate(pipeline)
    severity_dist = {}
    async for doc in severity_cursor:
        severity_dist[doc["_id"]] = doc["count"]

    pipeline2 = [
        {"$match": {"status": "active", "location": {"$ne": None}}},
        {"$group": {"_id": "$location", "count": {"$sum": 1}}}
    ]
    location_cursor = db.aggregate(pipeline2)
    hospital_load = {}
    async for doc in location_cursor:
        hospital_load[doc["_id"]] = doc["count"]

    now = datetime.utcnow()
    since = now - timedelta(hours=24)
    pipeline3 = [
        {"$match": {"timestamp": {"$gte": since.timestamp()}}},
        {"$group": {
            "_id": {"$hour": {"$toDate": {"$multiply": ["$timestamp", 1000]}}},
            "count": {"$sum": 1}
        }},
        {"$sort": {"_id": 1}}
    ]
    trends_cursor = db.aggregate(pipeline3)
    trends = []
    async for doc in trends_cursor:
        trends.append({"hour": doc["_id"], "count": doc["count"]})

    return {
        "active_patients": active_count,
        "severity_distribution": severity_dist,
        "hospital_load": hospital_load,
        "recent_trends": trends
    }