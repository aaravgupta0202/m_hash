"""Drives a live simulation run: emits events on a short real-time cadence,
broadcasting each one over the run's WebSocket channel, then recomputes the
detection pipeline once the burst is complete so the dashboard sees risk
change in response to what just happened - not a canned number.
"""
import asyncio
import random
import time
from datetime import datetime
from typing import Optional

from app.database import SessionLocal
from app.models.alert import Alert
from app.models.simulation import SimulationRun
from app.models.user import User
from app.services import live_scenarios
from app.services.detection_runner import recompute_user_state
from app.services.event_service import record_event
from app.services.ws_manager import manager


def pick_target_user(db, scenario_name: str, target_user_id: Optional[int] = None) -> Optional[User]:
    if target_user_id:
        user = db.get(User, target_user_id)
        if user:
            return user

    tag_map = {
        "LEGITIMATE_PROJECT_CHANGE": "LEGITIMATE_PROJECT_CHANGE",
        "COMPROMISED_ACCOUNT": "COMPROMISED_ACCOUNT",
        "MALICIOUS_INSIDER": "MALICIOUS_INSIDER",
    }
    tag = tag_map.get(scenario_name)
    if tag:
        user = db.query(User).filter(User.scenario_tag == tag).first()
        if user:
            return user

    candidates = db.query(User).filter(User.is_scenario_actor.is_(False)).all()
    if candidates:
        return random.choice(candidates)
    return db.query(User).first()


async def run_simulation(run_id: int, scenario_name: str, target_user_id: Optional[int] = None):
    db = SessionLocal()
    try:
        run = db.get(SimulationRun, run_id)
        user = pick_target_user(db, scenario_name, target_user_id)
        if run is None or user is None:
            return

        run.status = "RUNNING"
        run.started_at = datetime.utcnow()
        events = live_scenarios.build_live_events(scenario_name, user, datetime.utcnow())
        run.total_events = len(events)
        db.commit()

        await manager.broadcast(run_id, {
            "type": "start", "scenario": scenario_name, "user": user.to_summary_dict(),
            "total_events": len(events),
        })

        t_start = time.time()
        for delay, kwargs in events:
            elapsed = time.time() - t_start
            wait = max(0.0, delay - elapsed)
            await asyncio.sleep(wait)

            kwargs = dict(kwargs)
            kwargs["timestamp"] = datetime.utcnow()
            ev = record_event(db, user_id=user.id, simulation_run_id=run_id, commit=True, **kwargs)

            run.events_emitted += 1
            db.commit()
            await manager.broadcast(run_id, {"type": "event", "event": ev.to_dict()})

        result = recompute_user_state(db, user, datetime.utcnow(), persist_history=True,
                                       update_current=True, commit=True)
        alert = (
            db.query(Alert)
            .filter(Alert.user_id == user.id)
            .order_by(Alert.updated_at.desc())
            .first()
        )

        await manager.broadcast(run_id, {
            "type": "risk_update",
            "user_id": user.id,
            "user_name": user.name,
            "risk_score": result.risk_score,
            "confidence": result.confidence,
            "behavioral_state": result.behavioral_state,
            "explanation": result.explanation,
        })
        if alert:
            await manager.broadcast(run_id, {"type": "alert", "alert": alert.to_dict()})

        run.status = "COMPLETED"
        run.completed_at = datetime.utcnow()
        db.commit()
        await manager.broadcast(run_id, {"type": "done", "run": run.to_dict()})
    except Exception as exc:  # noqa: BLE001 - surface any failure to the live UI
        db.rollback()
        run = db.get(SimulationRun, run_id)
        if run:
            run.status = "FAILED"
            db.commit()
        await manager.broadcast(run_id, {"type": "error", "message": str(exc)})
    finally:
        db.close()
