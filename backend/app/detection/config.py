"""Tunable detection/scoring configuration.

Centralizing every threshold and weight here is what makes the risk engine
"explainable, not a mysterious AI number" (see README / product spec). This
is a prototype scoring model, NOT a validated production security standard -
the numbers below are reasonable defaults chosen to make the demo scenarios
tell a clear story, not the output of a calibration study.
"""
from datetime import timedelta

# ---- Baseline windows -------------------------------------------------
BASELINE_LONG_TERM_DAYS = 21
BASELINE_LONG_TERM_EXCLUDE_RECENT_DAYS = 3  # long-term window ends this many days before "now"
BASELINE_RECENT_DAYS = 3
MIN_BASELINE_EVENTS = 10

# ---- Temporal correlation windows -------------------------------------
TIME_WINDOWS = {
    "immediate": timedelta(minutes=15),
    "short": timedelta(hours=1),
    "day": timedelta(hours=24),
    "extended": timedelta(days=7),
}
EVENT_ANALYSIS_WINDOW_DAYS = 7

# ---- Deviation thresholds ----------------------------------------------
UNUSUAL_HOUR_MARGIN_HOURS = 1.5
VOLUME_ZSCORE_MEDIUM = 2.0
VOLUME_ZSCORE_HIGH = 3.5
RARE_SHARE_THRESHOLD = 0.05  # an app/action/resource-type seen <5% of the time is "unusual"

SENSITIVE_ACTIONS = {
    "FORWARDING_RULE_CREATED",
    "BENEFICIARY_ADD",
    "TRANSFER_CREATE",
    "ATTACHMENT_DOWNLOAD",
}
SENSITIVE_RESOURCE_LEVELS = {"CONFIDENTIAL", "RESTRICTED"}

# ---- Severity weighting --------------------------------------------------
SEVERITY_WEIGHT = {"LOW": 8, "MEDIUM": 16, "HIGH": 28, "CRITICAL": 42}
DEVIATION_SCORE_CAP = 62

# ---- Risk engine weights (documented, editable) --------------------------
RISK_WEIGHTS = {
    "baseline_deviation": 1.0,
    "sensitive_resource_bonus": 14,
    "cross_app_correlation_bonus": 16,
    "burst_correlation_bonus": 8,
    "persistence_bonus_per_day": 3,
    "persistence_bonus_cap": 15,
}

STATE_THRESHOLDS = {
    "NORMAL": (0, 25),
    "DRIFT": (25, 50),
    "SUSPICIOUS": (50, 75),
    "HIGH_RISK": (75, 101),
}

ALERT_SEVERITY_THRESHOLDS = {
    "LOW": (0, 30),
    "MEDIUM": (30, 55),
    "HIGH": (55, 78),
    "CRITICAL": (78, 101),
}
ALERT_MIN_SCORE_TO_CREATE = 30
ALERT_MERGE_WINDOW_DAYS = 3  # extend an existing open alert instead of creating a new one

# ---- Context discount factors (fraction of signal score kept after context) --
CONTEXT_DISCOUNT = {
    "NEW_DEVICE_APPROVAL": 0.0,
    "APPROVED_TRAVEL": 0.0,
    "PROJECT_ASSIGNMENT": 0.25,
    "ROLE_CHANGE": 0.3,
    "TEMPORARY_ACCESS": 0.2,
    "MAINTENANCE_ACTIVITY": 0.35,
}
