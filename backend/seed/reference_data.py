"""Static reference data used to seed the demo organization.

18 fictional users across 7 roles / 6 departments, with 3 of them tagged as
scenario actors (see seed/scenarios.py) so the platform has something
interesting to detect on first launch.
"""

DEPARTMENTS = ["Engineering", "Finance", "HR", "Marketing", "Sales", "IT", "Product"]

ROLES = [
    "Software Engineer",
    "Finance Analyst",
    "HR Manager",
    "Marketing Manager",
    "Sales Executive",
    "System Administrator",
    "Product Manager",
]

PROJECTS = [
    ("Atlas", "Core platform migration"),
    ("Phoenix", "New customer analytics initiative"),
    ("Helios", "Q4 marketing campaign"),
    ("Ledger", "Finance systems modernization"),
]

LOCATIONS = [
    "New York, US", "London, UK", "Bangalore, IN", "Berlin, DE", "Singapore, SG",
    "Toronto, CA", "Sydney, AU", "San Francisco, US", "Austin, US", "Dublin, IE",
]

# Locations with no prior organizational footprint at all - used as the
# "impossible" location for the compromised-account scenario.
UNUSUAL_LOCATIONS = ["Lagos, NG", "Bucharest, RO", "Manila, PH"]

# name, role, department, home_location_index, project (or None), scenario_tag
USER_DEFS = [
    ("Priya Nair", "Software Engineer", "Engineering", 0, "Atlas", "LEGITIMATE_PROJECT_CHANGE"),
    ("Marcus Webb", "Software Engineer", "Engineering", 1, "Atlas", None),
    ("Elena Petrova", "Software Engineer", "Engineering", 3, "Atlas", None),
    ("Tom Nguyen", "Software Engineer", "Engineering", 8, "Atlas", None),
    ("Wei Zhang", "Finance Analyst", "Finance", 2, "Ledger", "MALICIOUS_INSIDER"),
    ("Sofia Alvarez", "Finance Analyst", "Finance", 0, "Ledger", None),
    ("Ahmed Farouk", "Finance Analyst", "Finance", 4, "Ledger", None),
    ("Grace Kim", "HR Manager", "HR", 6, None, None),
    ("Daniel Osei", "HR Manager", "HR", 1, None, None),
    ("Laura Bennett", "Marketing Manager", "Marketing", 7, "Helios", None),
    ("Hiro Tanaka", "Marketing Manager", "Marketing", 4, "Helios", None),
    ("Jasmine Carter", "Sales Executive", "Sales", 0, None, "COMPROMISED_ACCOUNT"),
    ("Ravi Kumar", "Sales Executive", "Sales", 2, None, None),
    ("Chloe Dubois", "Sales Executive", "Sales", 9, None, None),
    ("Victor Ionescu", "System Administrator", "IT", 5, None, None),
    ("Natasha Ivanova", "System Administrator", "IT", 1, None, None),
    ("Ben O'Connor", "Product Manager", "Product", 8, "Phoenix", None),
    ("Meera Iyer", "Product Manager", "Product", 2, "Phoenix", None),
]


def email_for(name: str) -> str:
    handle = name.lower().replace(" ", ".").replace("'", "")
    return f"{handle}@northwind-corp.example"
