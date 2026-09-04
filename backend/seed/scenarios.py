"""The three narrative scenarios baked into the seed data:

- Legitimate project change (false-positive control)
- Compromised account (gradual, device/location/time-driven takeover that
  culminates in a cross-application correlated burst)
- Malicious insider (no device/location/time anomalies at all - pure
  scope-of-access and action-based drift, on the user's own normal device)

Each returns (events, context_events) where events are kwargs dicts for
event_service.record_event and context_events are kwargs for ContextEvent.
"""
from datetime import datetime, timedelta

COMPROMISED_DEVICE = "Unregistered-Laptop-88C2"
COMPROMISED_LOCATION = "Lagos, NG"


def _day(now: datetime, offset: int, hour: int, minute: int = 0) -> datetime:
    base = (now - timedelta(days=offset)).replace(hour=0, minute=0, second=0, microsecond=0)
    return base + timedelta(hours=hour, minutes=minute)


def legitimate_project_change_events(user_name: str, now: datetime, home_location: str, primary_device: str):
    events = []
    for offset in range(5, -1, -1):
        day_dt = _day(now, offset, 10, 15)
        events.append({
            "application": "GMAIL", "event_type": "EMAIL_OPEN", "action": "EMAIL_OPEN",
            "resource_id": f"phoenix_email-{4000 + offset}", "resource_type": "phoenix_email_thread",
            "resource_sensitivity": "INTERNAL", "device_name": primary_device, "location": home_location,
            "data_volume": 18.0, "timestamp": day_dt, "metadata": {"note": "Phoenix onboarding thread"},
        })
        events.append({
            "application": "GMAIL", "event_type": "ATTACHMENT_DOWNLOAD", "action": "ATTACHMENT_DOWNLOAD",
            "resource_id": f"phoenix_spec-{5000 + offset}", "resource_type": "phoenix_attachment",
            "resource_sensitivity": "CONFIDENTIAL", "device_name": primary_device, "location": home_location,
            "data_volume": 220.0, "timestamp": day_dt + timedelta(minutes=20),
            "metadata": {"note": "Phoenix design spec"},
        })
        events.append({
            "application": "SOCIAL", "event_type": "MESSAGE_SEND", "action": "MESSAGE_SEND",
            "resource_id": f"phoenix_channel-{offset}", "resource_type": "phoenix_message",
            "resource_sensitivity": "INTERNAL", "device_name": primary_device, "location": home_location,
            "data_volume": 4.0, "timestamp": day_dt + timedelta(minutes=35),
            "metadata": {"note": "Coordinating with new Phoenix teammates"},
        })

    context_events = [{
        "context_type": "PROJECT_ASSIGNMENT",
        "description": "Assigned to Project Phoenix (customer analytics initiative)",
        "start_date": _day(now, 5, 8, 0),
        "end_date": None,
        "metadata": {"from_project": "Atlas", "to_project": "Phoenix"},
    }]
    return events, context_events


def compromised_account_events(user_name: str, now: datetime, home_location: str, primary_device: str):
    events = []

    # Stage 1 (day -6): new device appears, otherwise unremarkable.
    events.append({
        "application": "GMAIL", "event_type": "LOGIN", "action": "LOGIN",
        "resource_id": None, "resource_type": None, "resource_sensitivity": "INTERNAL",
        "device_name": COMPROMISED_DEVICE, "location": home_location, "data_volume": 0.0,
        "timestamp": _day(now, 6, 19, 40), "metadata": {"stage": 1, "note": "New device first seen"},
    })

    # Stage 2 (day -5): unusual login time from that device.
    t = _day(now, 5, 2, 13)
    events.append({
        "application": "GMAIL", "event_type": "LOGIN", "action": "LOGIN",
        "resource_id": None, "resource_type": None, "resource_sensitivity": "INTERNAL",
        "device_name": COMPROMISED_DEVICE, "location": home_location, "data_volume": 0.0,
        "timestamp": t, "metadata": {"stage": 2},
    })
    events.append({
        "application": "GMAIL", "event_type": "EMAIL_OPEN", "action": "EMAIL_OPEN",
        "resource_id": "email-9001", "resource_type": "email_thread", "resource_sensitivity": "INTERNAL",
        "device_name": COMPROMISED_DEVICE, "location": home_location, "data_volume": 12.0,
        "timestamp": t + timedelta(minutes=4), "metadata": {"stage": 2},
    })

    # Stage 3 (day -4): unusual location joins the new device + odd hour.
    t = _day(now, 4, 2, 25)
    events.append({
        "application": "GMAIL", "event_type": "LOGIN", "action": "LOGIN",
        "resource_id": None, "resource_type": None, "resource_sensitivity": "INTERNAL",
        "device_name": COMPROMISED_DEVICE, "location": COMPROMISED_LOCATION, "data_volume": 0.0,
        "timestamp": t, "metadata": {"stage": 3},
    })
    events.append({
        "application": "GMAIL", "event_type": "EMAIL_SEARCH", "action": "EMAIL_SEARCH",
        "resource_id": "mailbox-search", "resource_type": "mailbox", "resource_sensitivity": "INTERNAL",
        "device_name": COMPROMISED_DEVICE, "location": COMPROMISED_LOCATION, "data_volume": 8.0,
        "timestamp": t + timedelta(minutes=5), "metadata": {"stage": 3, "result_count": 22},
    })

    # Stage 4 (day -3): unusual application/resource access - sensitive attachment, atypical for a Sales Exec.
    t = _day(now, 3, 2, 30)
    events.append({
        "application": "GMAIL", "event_type": "LOGIN", "action": "LOGIN",
        "resource_id": None, "resource_type": None, "resource_sensitivity": "INTERNAL",
        "device_name": COMPROMISED_DEVICE, "location": COMPROMISED_LOCATION, "data_volume": 0.0,
        "timestamp": t, "metadata": {"stage": 4},
    })
    events.append({
        "application": "GMAIL", "event_type": "EMAIL_SEARCH", "action": "EMAIL_SEARCH",
        "resource_id": "mailbox-search", "resource_type": "mailbox", "resource_sensitivity": "INTERNAL",
        "device_name": COMPROMISED_DEVICE, "location": COMPROMISED_LOCATION, "data_volume": 15.0,
        "timestamp": t + timedelta(minutes=3), "metadata": {"stage": 4, "result_count": 48},
    })
    events.append({
        "application": "GMAIL", "event_type": "ATTACHMENT_DOWNLOAD", "action": "ATTACHMENT_DOWNLOAD",
        "resource_id": "contract-7781", "resource_type": "confidential_contract", "resource_sensitivity": "CONFIDENTIAL",
        "device_name": COMPROMISED_DEVICE, "location": COMPROMISED_LOCATION, "data_volume": 340.0,
        "timestamp": t + timedelta(minutes=9), "metadata": {"stage": 4},
    })

    # Stage 5 (day -2): large data activity.
    t = _day(now, 2, 2, 45)
    events.append({
        "application": "GMAIL", "event_type": "LOGIN", "action": "LOGIN",
        "resource_id": None, "resource_type": None, "resource_sensitivity": "INTERNAL",
        "device_name": COMPROMISED_DEVICE, "location": COMPROMISED_LOCATION, "data_volume": 0.0,
        "timestamp": t, "metadata": {"stage": 5},
    })
    for i in range(4):
        events.append({
            "application": "GMAIL", "event_type": "ATTACHMENT_DOWNLOAD", "action": "ATTACHMENT_DOWNLOAD",
            "resource_id": f"contract-{7800 + i}", "resource_type": "confidential_contract",
            "resource_sensitivity": "CONFIDENTIAL", "device_name": COMPROMISED_DEVICE,
            "location": COMPROMISED_LOCATION, "data_volume": 900.0 + i * 150,
            "timestamp": t + timedelta(minutes=6 + i * 4), "metadata": {"stage": 5},
        })

    # Stage 6 (day -1): sensitive action + cross-application correlated burst
    # (mirrors the exact walk-through in the product spec).
    base = _day(now, 1, 9, 12)
    events.append({
        "application": "GMAIL", "event_type": "LOGIN", "action": "LOGIN",
        "resource_id": None, "resource_type": None, "resource_sensitivity": "INTERNAL",
        "device_name": COMPROMISED_DEVICE, "location": COMPROMISED_LOCATION, "data_volume": 0.0,
        "timestamp": base, "metadata": {"stage": 6},
    })
    events.append({
        "application": "GMAIL", "event_type": "EMAIL_SEARCH", "action": "EMAIL_SEARCH",
        "resource_id": "mailbox-search", "resource_type": "mailbox", "resource_sensitivity": "INTERNAL",
        "device_name": COMPROMISED_DEVICE, "location": COMPROMISED_LOCATION, "data_volume": 18.0,
        "timestamp": base + timedelta(minutes=6), "metadata": {"stage": 6, "result_count": 52},
    })
    events.append({
        "application": "SOCIAL", "event_type": "LOGIN", "action": "LOGIN",
        "resource_id": None, "resource_type": None, "resource_sensitivity": "INTERNAL",
        "device_name": COMPROMISED_DEVICE, "location": COMPROMISED_LOCATION, "data_volume": 0.0,
        "timestamp": base + timedelta(minutes=23), "metadata": {"stage": 6},
    })
    events.append({
        "application": "SOCIAL", "event_type": "MESSAGE_READ", "action": "MESSAGE_READ",
        "resource_id": "message-thread-privatedm", "resource_type": "message", "resource_sensitivity": "INTERNAL",
        "device_name": COMPROMISED_DEVICE, "location": COMPROMISED_LOCATION, "data_volume": 25.0,
        "timestamp": base + timedelta(minutes=29), "metadata": {"stage": 6, "note": "Reading unfamiliar DM threads"},
    })
    events.append({
        "application": "FINANCE", "event_type": "LOGIN", "action": "LOGIN",
        "resource_id": None, "resource_type": None, "resource_sensitivity": "INTERNAL",
        "device_name": COMPROMISED_DEVICE, "location": COMPROMISED_LOCATION, "data_volume": 0.0,
        "timestamp": base + timedelta(minutes=51), "metadata": {"stage": 6},
    })
    events.append({
        "application": "FINANCE", "event_type": "BENEFICIARY_ADD", "action": "BENEFICIARY_ADD",
        "resource_id": "beneficiary-9921", "resource_type": "beneficiary", "resource_sensitivity": "RESTRICTED",
        "device_name": COMPROMISED_DEVICE, "location": COMPROMISED_LOCATION, "data_volume": 2.0,
        "timestamp": base + timedelta(minutes=55), "metadata": {"stage": 6, "note": "Unfamiliar beneficiary added"},
    })

    # Day 0 (today): sustained / escalating - attacker moves money and exfiltrates further.
    t = _day(now, 0, 9, 5)
    events.append({
        "application": "FINANCE", "event_type": "LOGIN", "action": "LOGIN",
        "resource_id": None, "resource_type": None, "resource_sensitivity": "INTERNAL",
        "device_name": COMPROMISED_DEVICE, "location": COMPROMISED_LOCATION, "data_volume": 0.0,
        "timestamp": t, "metadata": {"stage": 7},
    })
    events.append({
        "application": "FINANCE", "event_type": "TRANSFER_CREATE", "action": "TRANSFER_CREATE",
        "resource_id": "transfer-5510", "resource_type": "transfer", "resource_sensitivity": "RESTRICTED",
        "device_name": COMPROMISED_DEVICE, "location": COMPROMISED_LOCATION, "data_volume": 1.0,
        "timestamp": t + timedelta(minutes=5), "metadata": {"stage": 7, "amount": 18500},
    })
    events.append({
        "application": "GMAIL", "event_type": "ATTACHMENT_DOWNLOAD", "action": "ATTACHMENT_DOWNLOAD",
        "resource_id": "financial-export-2201", "resource_type": "confidential_contract",
        "resource_sensitivity": "CONFIDENTIAL", "device_name": COMPROMISED_DEVICE, "location": COMPROMISED_LOCATION,
        "data_volume": 1200.0, "timestamp": t + timedelta(minutes=14), "metadata": {"stage": 7},
    })

    return events, []


def malicious_insider_events(user_name: str, now: datetime, home_location: str, primary_device: str):
    events = []

    # Days -6..-4: behaves normally (handled by normal_activity generator elsewhere).

    # Day -3: starts accessing accounts outside normal scope.
    t = _day(now, 3, 14, 10)
    for i in range(3):
        events.append({
            "application": "FINANCE", "event_type": "ACCOUNT_VIEW", "action": "ACCOUNT_VIEW",
            "resource_id": f"exec-account-{i}", "resource_type": "restricted_executive_account",
            "resource_sensitivity": "RESTRICTED", "device_name": primary_device, "location": home_location,
            "data_volume": 6.0, "timestamp": t + timedelta(minutes=i * 7),
            "metadata": {"note": "Outside assigned portfolio"},
        })

    # Day -2: bulk transaction review + starts moving data toward email.
    t = _day(now, 2, 15, 0)
    for i in range(6):
        events.append({
            "application": "FINANCE", "event_type": "TRANSACTION_VIEW", "action": "TRANSACTION_VIEW",
            "resource_id": f"txn-bulk-{i}", "resource_type": "restricted_executive_account",
            "resource_sensitivity": "RESTRICTED", "device_name": primary_device, "location": home_location,
            "data_volume": 4.0, "timestamp": t + timedelta(minutes=i * 3),
            "metadata": {"note": "Bulk review outside assigned portfolio"},
        })

    # Day -1: cross-application data movement - exports financial data via email.
    t = _day(now, 1, 20, 30)
    events.append({
        "application": "FINANCE", "event_type": "TRANSACTION_VIEW", "action": "TRANSACTION_VIEW",
        "resource_id": "txn-export-source", "resource_type": "restricted_executive_account",
        "resource_sensitivity": "RESTRICTED", "device_name": primary_device, "location": home_location,
        "data_volume": 30.0, "timestamp": t, "metadata": {"note": "Prepares export"},
    })
    events.append({
        "application": "GMAIL", "event_type": "EMAIL_SEND", "action": "EMAIL_SEND",
        "resource_id": "financial-export-mail", "resource_type": "financial_export",
        "resource_sensitivity": "CONFIDENTIAL", "device_name": primary_device, "location": home_location,
        "data_volume": 980.0, "timestamp": t + timedelta(minutes=18),
        "metadata": {"note": "Large financial export emailed externally"},
    })

    # Day 0: classic insider fraud pattern - add beneficiary, then transfer, on own device/hours.
    t = _day(now, 0, 16, 45)
    events.append({
        "application": "FINANCE", "event_type": "BENEFICIARY_ADD", "action": "BENEFICIARY_ADD",
        "resource_id": "beneficiary-insider-1", "resource_type": "beneficiary", "resource_sensitivity": "RESTRICTED",
        "device_name": primary_device, "location": home_location, "data_volume": 1.0,
        "timestamp": t, "metadata": {"note": "New beneficiary, outside normal role activity"},
    })
    events.append({
        "application": "FINANCE", "event_type": "TRANSFER_CREATE", "action": "TRANSFER_CREATE",
        "resource_id": "transfer-insider-1", "resource_type": "transfer", "resource_sensitivity": "RESTRICTED",
        "device_name": primary_device, "location": home_location, "data_volume": 1.0,
        "timestamp": t + timedelta(minutes=9), "metadata": {"note": "Transfer to newly added beneficiary", "amount": 42000},
    })

    return events, []
