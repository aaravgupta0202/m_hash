from fastapi import APIRouter

from app.detection import config as cfg

router = APIRouter(prefix="/api/settings", tags=["settings"])


@router.get("")
def get_settings():
    return {
        "disclaimer": "This is a prototype scoring model for demonstration purposes, "
                       "not a validated production security standard.",
        "risk_weights": cfg.RISK_WEIGHTS,
        "severity_weight": cfg.SEVERITY_WEIGHT,
        "state_thresholds": cfg.STATE_THRESHOLDS,
        "alert_severity_thresholds": cfg.ALERT_SEVERITY_THRESHOLDS,
        "alert_min_score_to_create": cfg.ALERT_MIN_SCORE_TO_CREATE,
        "context_discount": cfg.CONTEXT_DISCOUNT,
        "baseline_long_term_days": cfg.BASELINE_LONG_TERM_DAYS,
        "baseline_recent_days": cfg.BASELINE_RECENT_DAYS,
    }
