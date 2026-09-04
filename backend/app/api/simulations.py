import asyncio

from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.simulation import SimulationRun
from app.schemas.requests import SimulationCreateRequest
from app.services.simulation_runner import run_simulation
from app.services.ws_manager import manager

router = APIRouter(prefix="/api/simulations", tags=["simulations"])

SCENARIOS = [
    {"name": "NORMAL_ORGANIZATION", "label": "Normal Organization",
     "description": "Ordinary daily activity across the organization - a baseline for comparison."},
    {"name": "LEGITIMATE_PROJECT_CHANGE", "label": "Legitimate Project Change",
     "description": "A user is reassigned to a new project. Behavior shifts, but context explains it."},
    {"name": "COMPROMISED_ACCOUNT", "label": "Compromised Account",
     "description": "An account is gradually taken over: new device, odd hours, new location, then a cross-app burst."},
    {"name": "MALICIOUS_INSIDER", "label": "Malicious Insider",
     "description": "A legitimate user intentionally drifts outside their role scope - no device/location anomalies."},
    {"name": "CROSS_APPLICATION_ATTACK", "label": "Cross-Application Attack",
     "description": "A fast, correlated burst spanning Gmail, Social, and Finance within the same hour."},
]


@router.get("/scenarios")
def list_scenarios():
    return SCENARIOS


@router.get("")
def list_runs(db: Session = Depends(get_db)):
    runs = db.query(SimulationRun).order_by(SimulationRun.id.desc()).limit(50).all()
    return [r.to_dict() for r in runs]


@router.post("")
def create_run(body: SimulationCreateRequest, db: Session = Depends(get_db)):
    valid_names = {s["name"] for s in SCENARIOS}
    if body.scenario_name not in valid_names:
        raise HTTPException(400, f"Unknown scenario. Must be one of {sorted(valid_names)}")
    run = SimulationRun(scenario_name=body.scenario_name, status="PENDING",
                         config={"target_user_id": body.target_user_id})
    db.add(run)
    db.commit()
    db.refresh(run)
    return run.to_dict()


@router.post("/{run_id}/run")
async def start_run(run_id: int, db: Session = Depends(get_db)):
    run = db.get(SimulationRun, run_id)
    if not run:
        raise HTTPException(404, "Simulation run not found")
    if run.status == "RUNNING":
        return {"status": "already_running", "run": run.to_dict()}

    target_user_id = (run.config or {}).get("target_user_id")
    asyncio.create_task(run_simulation(run.id, run.scenario_name, target_user_id))
    return {"status": "started", "run_id": run.id}


@router.websocket("/{run_id}/ws")
async def simulation_ws(websocket: WebSocket, run_id: int):
    await manager.connect(run_id, websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(run_id, websocket)
