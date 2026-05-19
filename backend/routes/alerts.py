from fastapi import APIRouter
from services.database_service import DatabaseService

router = APIRouter()

@router.get("/")
async def get_alerts():
    db = DatabaseService.get_collection("alerts")
    cursor = db.find({}).sort("timestamp", -1).limit(50)
    alerts = await cursor.to_list(length=50)
    for a in alerts:
        a["_id"] = str(a["_id"])
    return alerts