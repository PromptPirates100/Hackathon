from fastapi import APIRouter, HTTPException
from services.database_service import DatabaseService

router = APIRouter()

@router.post("/")
async def save_patient(patient_data: dict):
    try:
        db = DatabaseService.get_collection("patients")
        patient_id = patient_data.get("patient_id")
        if not patient_id:
            raise HTTPException(status_code=400, detail="patient_id required")
        await db.replace_one({"patient_id": patient_id}, patient_data, upsert=True)
        return {"status": "saved", "patient_id": patient_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/")
async def get_active_patients():
    db = DatabaseService.get_collection("patients")
    cursor = db.find({"status": "active"}).sort("timestamp", -1)
    patients = await cursor.to_list(length=100)
    for p in patients:
        p["_id"] = str(p["_id"])
    return patients

@router.get("/{patient_id}")
async def get_patient(patient_id: str):
    db = DatabaseService.get_collection("patients")
    patient = await db.find_one({"patient_id": patient_id})
    if patient:
        patient["_id"] = str(patient["_id"])
        return patient
    raise HTTPException(status_code=404, detail="Patient not found")