import json
import os
import shutil
from fastapi import APIRouter, HTTPException, Request

router = APIRouter(prefix="/api/mock", tags=["mock"])

STATIC_DIR = os.path.join(os.path.dirname(__file__), "../../data/static")
ACTIVE_DIR = os.path.join(os.path.dirname(__file__), "../../data/active")

def get_active_path(app_name: str) -> str:
    return os.path.join(ACTIVE_DIR, f"{app_name}.json")

def get_static_path(app_name: str) -> str:
    return os.path.join(STATIC_DIR, f"{app_name}.json")

@router.get("/{app_name}")
def get_mock_data(app_name: str):
    if app_name not in ["social", "gmail", "finance"]:
        raise HTTPException(status_code=404, detail="App not found")
        
    active_path = get_active_path(app_name)
    if not os.path.exists(active_path):
        # Fallback to static if active doesn't exist
        static_path = get_static_path(app_name)
        if not os.path.exists(static_path):
            raise HTTPException(status_code=404, detail="Data not found")
        shutil.copy2(static_path, active_path)
        
    with open(active_path, "r", encoding="utf-8") as f:
        return json.load(f)

@router.put("/{app_name}")
async def update_mock_data(app_name: str, request: Request):
    if app_name not in ["social", "gmail", "finance"]:
        raise HTTPException(status_code=404, detail="App not found")
        
    data = await request.json()
    active_path = get_active_path(app_name)
    with open(active_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)
    return {"status": "ok"}

@router.post("/reset")
def reset_mock_data():
    os.makedirs(ACTIVE_DIR, exist_ok=True)
    for app_name in ["social", "gmail", "finance"]:
        static_path = get_static_path(app_name)
        active_path = get_active_path(app_name)
        if os.path.exists(static_path):
            shutil.copy2(static_path, active_path)
    return {"status": "reset_successful"}
