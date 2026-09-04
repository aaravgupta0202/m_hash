"""Builds short, watchable event sequences for the live Simulation Center.

Reuses the same narrative patterns as the historical seed scenarios
(seed/scenarios.py) but condensed to a handful of events spaced seconds
apart, so a demo audience can watch risk climb in real time instead of
waiting on a 6-day timeline.
"""
import random
from datetime import datetime

from app.models.user import User
from seed.normal_activity import generate_day_events
from seed.scenarios import COMPROMISED_DEVICE, COMPROMISED_LOCATION


def _user_context(user: User):
    location = user.usual_locations[0] if user.usual_locations else "New York, US"
    device_names = [d.device_name for d in user.devices] or ["Personal Laptop"]
    return location, device_names[0]


def normal_activity_burst(user: User, start: datetime) -> list[tuple[float, dict]]:
    location, device = _user_context(user)
    rng = random.Random(f"live-{user.id}-{start.isoformat()}")
    day_events = generate_day_events(
        rng=rng, user_name=user.name, role=user.role.name, day=start.date(),
        normal_start_hour=user.normal_start_hour, normal_end_hour=user.normal_end_hour,
        home_location=location, secondary_location=None, primary_device=device,
        secondary_device=None, project_slug=None,
    )[:8]
    out = []
    for i, kwargs in enumerate(day_events):
        kwargs.pop("_hour", None)
        kwargs["timestamp"] = None  # filled in at dispatch time
        out.append((i * 1.6, kwargs))
    return out


def legitimate_project_change_burst(user: User, start: datetime) -> list[tuple[float, dict]]:
    location, device = _user_context(user)
    events = [
        {"application": "GMAIL", "event_type": "EMAIL_OPEN", "action": "EMAIL_OPEN",
         "resource_id": "phoenix_email-live", "resource_type": "phoenix_email_thread",
         "resource_sensitivity": "INTERNAL", "device_name": device, "location": location,
         "data_volume": 18.0, "metadata": {"note": "Phoenix onboarding thread"}},
        {"application": "GMAIL", "event_type": "ATTACHMENT_DOWNLOAD", "action": "ATTACHMENT_DOWNLOAD",
         "resource_id": "phoenix_spec-live", "resource_type": "phoenix_attachment",
         "resource_sensitivity": "CONFIDENTIAL", "device_name": device, "location": location,
         "data_volume": 220.0, "metadata": {"note": "Phoenix design spec"}},
        {"application": "SOCIAL", "event_type": "MESSAGE_SEND", "action": "MESSAGE_SEND",
         "resource_id": "phoenix_channel-live", "resource_type": "phoenix_message",
         "resource_sensitivity": "INTERNAL", "device_name": device, "location": location,
         "data_volume": 4.0, "metadata": {"note": "Coordinating with new Phoenix teammates"}},
    ]
    return [(i * 2.0, e) for i, e in enumerate(events)]


def compromised_account_burst(user: User, start: datetime) -> list[tuple[float, dict]]:
    events = [
        {"application": "GMAIL", "event_type": "LOGIN", "action": "LOGIN",
         "resource_id": None, "resource_type": None, "resource_sensitivity": "INTERNAL",
         "device_name": COMPROMISED_DEVICE, "location": COMPROMISED_LOCATION, "data_volume": 0.0,
         "metadata": {"note": "Unrecognized device login"}},
        {"application": "GMAIL", "event_type": "EMAIL_SEARCH", "action": "EMAIL_SEARCH",
         "resource_id": "mailbox-search", "resource_type": "mailbox", "resource_sensitivity": "INTERNAL",
         "device_name": COMPROMISED_DEVICE, "location": COMPROMISED_LOCATION, "data_volume": 18.0,
         "metadata": {"result_count": 52}},
        {"application": "SOCIAL", "event_type": "LOGIN", "action": "LOGIN",
         "resource_id": None, "resource_type": None, "resource_sensitivity": "INTERNAL",
         "device_name": COMPROMISED_DEVICE, "location": COMPROMISED_LOCATION, "data_volume": 0.0,
         "metadata": {}},
        {"application": "SOCIAL", "event_type": "MESSAGE_READ", "action": "MESSAGE_READ",
         "resource_id": "message-thread-privatedm", "resource_type": "message", "resource_sensitivity": "INTERNAL",
         "device_name": COMPROMISED_DEVICE, "location": COMPROMISED_LOCATION, "data_volume": 25.0,
         "metadata": {"note": "Reading unfamiliar DM threads"}},
        {"application": "FINANCE", "event_type": "LOGIN", "action": "LOGIN",
         "resource_id": None, "resource_type": None, "resource_sensitivity": "INTERNAL",
         "device_name": COMPROMISED_DEVICE, "location": COMPROMISED_LOCATION, "data_volume": 0.0,
         "metadata": {}},
        {"application": "FINANCE", "event_type": "BENEFICIARY_ADD", "action": "BENEFICIARY_ADD",
         "resource_id": "beneficiary-live", "resource_type": "beneficiary", "resource_sensitivity": "RESTRICTED",
         "device_name": COMPROMISED_DEVICE, "location": COMPROMISED_LOCATION, "data_volume": 2.0,
         "metadata": {"note": "Unfamiliar beneficiary added"}},
        {"application": "FINANCE", "event_type": "TRANSFER_CREATE", "action": "TRANSFER_CREATE",
         "resource_id": "transfer-live", "resource_type": "transfer", "resource_sensitivity": "RESTRICTED",
         "device_name": COMPROMISED_DEVICE, "location": COMPROMISED_LOCATION, "data_volume": 1.0,
         "metadata": {"amount": 18500}},
    ]
    return [(i * 2.2, e) for i, e in enumerate(events)]


def malicious_insider_burst(user: User, start: datetime) -> list[tuple[float, dict]]:
    location, device = _user_context(user)
    events = [
        {"application": "FINANCE", "event_type": "ACCOUNT_VIEW", "action": "ACCOUNT_VIEW",
         "resource_id": "exec-account-live", "resource_type": "restricted_executive_account",
         "resource_sensitivity": "RESTRICTED", "device_name": device, "location": location,
         "data_volume": 6.0, "metadata": {"note": "Outside assigned portfolio"}},
        {"application": "FINANCE", "event_type": "TRANSACTION_VIEW", "action": "TRANSACTION_VIEW",
         "resource_id": "txn-bulk-live", "resource_type": "restricted_executive_account",
         "resource_sensitivity": "RESTRICTED", "device_name": device, "location": location,
         "data_volume": 30.0, "metadata": {"note": "Bulk review outside assigned portfolio"}},
        {"application": "GMAIL", "event_type": "EMAIL_SEND", "action": "EMAIL_SEND",
         "resource_id": "financial-export-live", "resource_type": "financial_export",
         "resource_sensitivity": "CONFIDENTIAL", "device_name": device, "location": location,
         "data_volume": 980.0, "metadata": {"note": "Large financial export emailed externally"}},
        {"application": "FINANCE", "event_type": "BENEFICIARY_ADD", "action": "BENEFICIARY_ADD",
         "resource_id": "beneficiary-insider-live", "resource_type": "beneficiary", "resource_sensitivity": "RESTRICTED",
         "device_name": device, "location": location, "data_volume": 1.0,
         "metadata": {"note": "New beneficiary, outside normal role activity"}},
        {"application": "FINANCE", "event_type": "TRANSFER_CREATE", "action": "TRANSFER_CREATE",
         "resource_id": "transfer-insider-live", "resource_type": "transfer", "resource_sensitivity": "RESTRICTED",
         "device_name": device, "location": location, "data_volume": 1.0,
         "metadata": {"note": "Transfer to newly added beneficiary", "amount": 42000}},
    ]
    return [(i * 2.5, e) for i, e in enumerate(events)]


BUILDERS = {
    "NORMAL_ORGANIZATION": normal_activity_burst,
    "LEGITIMATE_PROJECT_CHANGE": legitimate_project_change_burst,
    "COMPROMISED_ACCOUNT": compromised_account_burst,
    "MALICIOUS_INSIDER": malicious_insider_burst,
    "CROSS_APPLICATION_ATTACK": compromised_account_burst,
}


def build_live_events(scenario_name: str, user: User, start: datetime) -> list[tuple[float, dict]]:
    builder = BUILDERS.get(scenario_name, normal_activity_burst)
    return builder(user, start)
