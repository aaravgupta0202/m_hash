"""Builds the entire demo organization on first launch: departments, roles,
projects, 18 users with devices, ~30 days of baseline activity, three
narrative scenarios layered on top of three of those users, and the
behavioral trend history / alerts that fall out of running the detection
pipeline once per day over the scenario window.
"""
import random
from datetime import datetime, timedelta

from sqlalchemy.orm import Session

from app.models.context import ContextEvent
from app.models.org import Department, Project, ProjectMembership, Role
from app.models.user import Device, User
from app.services.detection_runner import recompute_user_state
from app.services.event_service import record_event
from seed.activity_profiles import ROLE_PROFILES
from seed.normal_activity import generate_day_events
from seed.reference_data import DEPARTMENTS, LOCATIONS, PROJECTS, ROLES, USER_DEFS, email_for
from seed.scenarios import (
    compromised_account_events,
    legitimate_project_change_events,
    malicious_insider_events,
)

BASELINE_TOTAL_DAYS = 30
SCENARIO_WINDOW_DAYS = 7  # last 7 offsets (6..0) carry the narrative overlays
RNG_SEED = 42


def slugify(name: str) -> str:
    return name.lower()


def database_is_seeded(db: Session) -> bool:
    return db.query(User).count() > 0


def run_seed(db: Session) -> None:
    if database_is_seeded(db):
        return

    now = datetime.utcnow().replace(minute=0, second=0, microsecond=0)

    dept_rows = {name: Department(name=name) for name in DEPARTMENTS}
    role_rows = {name: Role(name=name) for name in ROLES}
    project_rows = {name: Project(name=name, description=desc) for name, desc in PROJECTS}
    db.add_all(list(dept_rows.values()) + list(role_rows.values()) + list(project_rows.values()))
    db.flush()

    users_by_name: dict[str, User] = {}
    home_locations: dict[str, str] = {}
    primary_devices: dict[str, str] = {}
    secondary_devices: dict[str, str] = {}
    project_slugs: dict[str, str | None] = {}

    for name, role, department, loc_idx, project_name, scenario_tag in USER_DEFS:
        user = User(
            name=name,
            email=email_for(name),
            role_id=role_rows[role].id,
            department_id=dept_rows[department].id,
            normal_start_hour=9,
            normal_end_hour=18,
            usual_locations=[LOCATIONS[loc_idx]],
            is_scenario_actor=scenario_tag is not None,
            scenario_tag=scenario_tag,
        )
        db.add(user)
        db.flush()
        users_by_name[name] = user
        home_locations[name] = LOCATIONS[loc_idx]

        first_name = name.split()[0]
        primary_devices[name] = f"{first_name}'s Laptop"
        secondary_devices[name] = f"{first_name}'s Phone"
        device_seen = now - timedelta(days=BASELINE_TOTAL_DAYS + 10)
        db.add(Device(user_id=user.id, device_name=primary_devices[name], device_type="laptop",
                       first_seen=device_seen, is_known=True))
        db.add(Device(user_id=user.id, device_name=secondary_devices[name], device_type="phone",
                       first_seen=device_seen, is_known=True))

        if project_name:
            db.add(ProjectMembership(user_id=user.id, project_id=project_rows[project_name].id,
                                      assigned_at=device_seen))
            project_slugs[name] = slugify(project_name)
        else:
            project_slugs[name] = None

    db.flush()

    # ---- Baseline + scenario-window normal daily activity for every user ----
    for name, user in users_by_name.items():
        role = user.role.name
        if role not in ROLE_PROFILES:
            continue
        rng = random.Random(f"{RNG_SEED}-{name}")
        for offset in range(BASELINE_TOTAL_DAYS - 1, -1, -1):
            day = (now - timedelta(days=offset)).date()
            day_events = generate_day_events(
                rng=rng,
                user_name=name,
                role=role,
                day=day,
                normal_start_hour=user.normal_start_hour,
                normal_end_hour=user.normal_end_hour,
                home_location=home_locations[name],
                secondary_location=None,
                primary_device=primary_devices[name],
                secondary_device=secondary_devices[name],
                project_slug=project_slugs[name],
            )
            for kwargs in day_events:
                kwargs.pop("_hour", None)
                record_event(db, user_id=user.id, commit=False, **kwargs)

    db.flush()

    # ---- Scenario overlays for the three narrative actors ----
    for name, user in users_by_name.items():
        tag = user.scenario_tag
        if tag == "LEGITIMATE_PROJECT_CHANGE":
            events, contexts = legitimate_project_change_events(name, now, home_locations[name], primary_devices[name])
        elif tag == "COMPROMISED_ACCOUNT":
            events, contexts = compromised_account_events(name, now, home_locations[name], primary_devices[name])
        elif tag == "MALICIOUS_INSIDER":
            events, contexts = malicious_insider_events(name, now, home_locations[name], primary_devices[name])
        else:
            continue

        for kwargs in events:
            record_event(db, user_id=user.id, commit=False, **kwargs)
        for ctx in contexts:
            db.add(ContextEvent(user_id=user.id, **ctx))

    db.commit()

    # ---- Run the detection pipeline once per day over the scenario window to
    # build the behavioral trend history and generate/evolve alerts. ----
    for name, user in users_by_name.items():
        for offset in range(SCENARIO_WINDOW_DAYS - 1, -1, -1):
            as_of = now - timedelta(days=offset)
            recompute_user_state(
                db, user, as_of,
                persist_history=True,
                update_current=(offset == 0),
                commit=False,
            )
    db.commit()
