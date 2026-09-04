from datetime import datetime, timedelta

from app.detection.signals import DeviationSignal
from app.detection.temporal_correlation import correlate
from app.scoring.risk_engine import compute_risk

NOW = datetime.utcnow()


def _signal(signal_type, severity, score, app="GMAIL", when=None):
    return DeviationSignal(
        signal_type=signal_type, severity=severity, score=score, reason=signal_type,
        application=app, occurred_at=when or NOW,
    )


def _correlate(signals):
    return correlate(signals, persistence_bonus_per_day=3, persistence_cap=15,
                      cross_app_bonus_max=16, burst_bonus_max=8)


def test_multiple_weak_signals_outscore_one_isolated_signal():
    isolated = [_signal("UNUSUAL_TIME", "LOW", 0.35)]
    isolated_result = compute_risk(isolated, _correlate(isolated), baseline_sample_size=200)

    corroborated = [
        _signal("UNUSUAL_TIME", "LOW", 0.35, when=NOW),
        _signal("NEW_DEVICE", "MEDIUM", 0.6, app="GMAIL", when=NOW + timedelta(minutes=5)),
        _signal("UNUSUAL_LOCATION", "MEDIUM", 0.55, app="FINANCE", when=NOW + timedelta(minutes=10)),
    ]
    corroborated_result = compute_risk(corroborated, _correlate(corroborated), baseline_sample_size=200)

    assert corroborated_result.risk_score > isolated_result.risk_score
    assert corroborated_result.confidence > isolated_result.confidence


def test_cross_application_signals_earn_a_correlation_bonus():
    single_app = [
        _signal("NEW_DEVICE", "MEDIUM", 0.6, app="GMAIL", when=NOW),
        _signal("UNUSUAL_TIME", "LOW", 0.35, app="GMAIL", when=NOW + timedelta(minutes=5)),
    ]
    multi_app = [
        _signal("NEW_DEVICE", "MEDIUM", 0.6, app="GMAIL", when=NOW),
        _signal("UNUSUAL_TIME", "LOW", 0.35, app="FINANCE", when=NOW + timedelta(minutes=5)),
    ]
    single_corr = _correlate(single_app)
    multi_corr = _correlate(multi_app)

    assert multi_corr.cross_app_bonus > single_corr.cross_app_bonus

    single_result = compute_risk(single_app, single_corr, baseline_sample_size=200)
    multi_result = compute_risk(multi_app, multi_corr, baseline_sample_size=200)
    assert multi_result.risk_score > single_result.risk_score


def test_no_signals_means_zero_risk():
    result = compute_risk([], _correlate([]), baseline_sample_size=200)
    assert result.risk_score == 0
    assert result.confidence == 0
