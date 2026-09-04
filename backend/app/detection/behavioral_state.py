from app.detection.config import ALERT_SEVERITY_THRESHOLDS, STATE_THRESHOLDS


def state_for_score(risk_score: float) -> str:
    for state, (lo, hi) in STATE_THRESHOLDS.items():
        if lo <= risk_score < hi:
            return state
    return "HIGH_RISK"


def severity_for_score(risk_score: float) -> str:
    for severity, (lo, hi) in ALERT_SEVERITY_THRESHOLDS.items():
        if lo <= risk_score < hi:
            return severity
    return "CRITICAL"


STATE_ORDER = ["NORMAL", "DRIFT", "SUSPICIOUS", "HIGH_RISK"]
