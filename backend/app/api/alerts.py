from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.alert import Alert, AnalystFeedback
from app.models.enums import AlertStatus
from app.schemas.requests import AlertFeedbackRequest

router = APIRouter(prefix="/api/alerts", tags=["alerts"])

FEEDBACK_STATUS_MAP = {
    "ACKNOWLEDGE": AlertStatus.ACKNOWLEDGED.value,
    "MARK_BENIGN": AlertStatus.MARKED_BENIGN.value,
    "MARK_EXPECTED": AlertStatus.MARKED_EXPECTED.value,
    "MARK_SUSPICIOUS": AlertStatus.MARKED_SUSPICIOUS.value,
    "CONFIRM_INCIDENT": AlertStatus.CONFIRMED_INCIDENT.value,
}


@router.get("")
def list_alerts(
    severity: str | None = Query(None),
    status: str | None = Query(None),
    user_id: int | None = Query(None),
    db: Session = Depends(get_db),
):
    q = db.query(Alert)
    if severity:
        q = q.filter(Alert.severity == severity)
    if status:
        q = q.filter(Alert.status == status)
    if user_id:
        q = q.filter(Alert.user_id == user_id)
    alerts = q.order_by(Alert.risk_score.desc()).all()
    return [a.to_dict(include_evidence=False) for a in alerts]


@router.get("/{alert_id}")
def get_alert(alert_id: int, db: Session = Depends(get_db)):
    alert = db.get(Alert, alert_id)
    if not alert:
        raise HTTPException(404, "Alert not found")
    return alert.to_dict(include_evidence=True)


@router.post("/{alert_id}/feedback")
def add_feedback(alert_id: int, body: AlertFeedbackRequest, db: Session = Depends(get_db)):
    alert = db.get(Alert, alert_id)
    if not alert:
        raise HTTPException(404, "Alert not found")

    if body.feedback_type not in FEEDBACK_STATUS_MAP:
        raise HTTPException(400, f"Unknown feedback_type. Must be one of {list(FEEDBACK_STATUS_MAP)}")

    feedback = AnalystFeedback(
        alert_id=alert.id,
        feedback_type=body.feedback_type,
        notes=body.notes,
        analyst_name=body.analyst_name,
        created_at=datetime.utcnow(),
    )
    db.add(feedback)
    alert.status = FEEDBACK_STATUS_MAP[body.feedback_type]
    alert.updated_at = datetime.utcnow()
    db.commit()
    return alert.to_dict(include_evidence=True)
