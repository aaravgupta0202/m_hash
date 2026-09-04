"""Per-role activity profiles used to generate realistic, non-identical
baseline behavior for each seeded user. Each role has a different mix of
applications, actions, and typical resource sensitivity - this is what makes
peer comparison and "usual behavior" meaningful per user.
"""

# action -> (event_type, resource_type, sensitivity, (min_kb, max_kb))
ACTION_CATALOG = {
    "SOCIAL": {
        "LOGIN": ("LOGIN", None, "INTERNAL", (0, 0)),
        "PROFILE_VIEW": ("PROFILE_VIEW", "profile", "PUBLIC", (1, 5)),
        "POST_CREATE": ("POST_CREATE", "post", "PUBLIC", (5, 50)),
        "MESSAGE_SEND": ("MESSAGE_SEND", "message", "INTERNAL", (1, 10)),
        "MESSAGE_READ": ("MESSAGE_READ", "message", "INTERNAL", (1, 5)),
        "CONTENT_DOWNLOAD": ("CONTENT_DOWNLOAD", "media", "INTERNAL", (50, 300)),
        "SETTINGS_CHANGE": ("SETTINGS_CHANGE", "account_settings", "INTERNAL", (0, 2)),
        "FOLLOW_USER": ("FOLLOW_USER", "profile", "PUBLIC", (0, 1)),
    },
    "GMAIL": {
        "LOGIN": ("LOGIN", None, "INTERNAL", (0, 0)),
        "EMAIL_OPEN": ("EMAIL_OPEN", "email_thread", "INTERNAL", (5, 40)),
        "EMAIL_SEARCH": ("EMAIL_SEARCH", "mailbox", "INTERNAL", (0, 5)),
        "EMAIL_SEND": ("EMAIL_SEND", "email_thread", "INTERNAL", (5, 60)),
        "ATTACHMENT_DOWNLOAD": ("ATTACHMENT_DOWNLOAD", "attachment", "CONFIDENTIAL", (50, 400)),
        "FORWARDING_RULE_CREATED": ("FORWARDING_RULE_CREATED", "mail_settings", "RESTRICTED", (0, 1)),
    },
    "FINANCE": {
        "LOGIN": ("LOGIN", None, "INTERNAL", (0, 0)),
        "ACCOUNT_VIEW": ("ACCOUNT_VIEW", "account", "CONFIDENTIAL", (1, 5)),
        "TRANSACTION_VIEW": ("TRANSACTION_VIEW", "transaction", "CONFIDENTIAL", (1, 10)),
        "BENEFICIARY_ADD": ("BENEFICIARY_ADD", "beneficiary", "RESTRICTED", (1, 3)),
        "TRANSFER_CREATE": ("TRANSFER_CREATE", "transfer", "RESTRICTED", (1, 3)),
        "PROFILE_CHANGE": ("PROFILE_CHANGE", "profile", "INTERNAL", (0, 2)),
    },
}

ROLE_PROFILES = {
    "Software Engineer": {
        "SOCIAL": {"daily_range": (2, 5), "weights": {"LOGIN": 1, "PROFILE_VIEW": 2, "POST_CREATE": 1, "MESSAGE_SEND": 2, "MESSAGE_READ": 3}},
        "GMAIL": {"daily_range": (4, 8), "weights": {"LOGIN": 1, "EMAIL_OPEN": 4, "EMAIL_SEARCH": 2, "EMAIL_SEND": 2, "ATTACHMENT_DOWNLOAD": 1}},
        "FINANCE": {"daily_range": (0, 1), "weights": {"LOGIN": 1, "ACCOUNT_VIEW": 1}},
    },
    "Finance Analyst": {
        "FINANCE": {"daily_range": (6, 12), "weights": {"LOGIN": 1, "ACCOUNT_VIEW": 3, "TRANSACTION_VIEW": 5, "PROFILE_CHANGE": 1}},
        "GMAIL": {"daily_range": (3, 6), "weights": {"LOGIN": 1, "EMAIL_OPEN": 3, "EMAIL_SEARCH": 1, "EMAIL_SEND": 2}},
        "SOCIAL": {"daily_range": (0, 2), "weights": {"LOGIN": 1, "MESSAGE_READ": 1}},
    },
    "HR Manager": {
        "GMAIL": {"daily_range": (5, 10), "weights": {"LOGIN": 1, "EMAIL_OPEN": 5, "EMAIL_SEARCH": 2, "EMAIL_SEND": 3, "ATTACHMENT_DOWNLOAD": 1}},
        "SOCIAL": {"daily_range": (2, 4), "weights": {"LOGIN": 1, "PROFILE_VIEW": 2, "MESSAGE_SEND": 1, "MESSAGE_READ": 2}},
        "FINANCE": {"daily_range": (0, 1), "weights": {"LOGIN": 1, "ACCOUNT_VIEW": 1}},
    },
    "Marketing Manager": {
        "SOCIAL": {"daily_range": (6, 12), "weights": {"LOGIN": 1, "PROFILE_VIEW": 2, "POST_CREATE": 4, "MESSAGE_SEND": 2, "CONTENT_DOWNLOAD": 2}},
        "GMAIL": {"daily_range": (3, 6), "weights": {"LOGIN": 1, "EMAIL_OPEN": 3, "EMAIL_SEND": 2, "EMAIL_SEARCH": 1}},
        "FINANCE": {"daily_range": (0, 1), "weights": {"LOGIN": 1, "ACCOUNT_VIEW": 1}},
    },
    "Sales Executive": {
        "GMAIL": {"daily_range": (6, 10), "weights": {"LOGIN": 1, "EMAIL_OPEN": 5, "EMAIL_SEARCH": 2, "EMAIL_SEND": 3}},
        "SOCIAL": {"daily_range": (2, 5), "weights": {"LOGIN": 1, "PROFILE_VIEW": 2, "MESSAGE_SEND": 2, "MESSAGE_READ": 2}},
        "FINANCE": {"daily_range": (0, 2), "weights": {"LOGIN": 1, "ACCOUNT_VIEW": 1, "TRANSACTION_VIEW": 1}},
    },
    "System Administrator": {
        "GMAIL": {"daily_range": (3, 6), "weights": {"LOGIN": 1, "EMAIL_OPEN": 3, "EMAIL_SEND": 1, "FORWARDING_RULE_CREATED": 1}},
        "SOCIAL": {"daily_range": (1, 3), "weights": {"LOGIN": 1, "SETTINGS_CHANGE": 1, "PROFILE_VIEW": 1}},
        "FINANCE": {"daily_range": (1, 3), "weights": {"LOGIN": 1, "ACCOUNT_VIEW": 2}},
    },
    "Product Manager": {
        "GMAIL": {"daily_range": (4, 7), "weights": {"LOGIN": 1, "EMAIL_OPEN": 4, "EMAIL_SEARCH": 2, "EMAIL_SEND": 2}},
        "SOCIAL": {"daily_range": (2, 5), "weights": {"LOGIN": 1, "PROFILE_VIEW": 2, "POST_CREATE": 1, "MESSAGE_SEND": 2}},
        "FINANCE": {"daily_range": (0, 1), "weights": {"LOGIN": 1, "ACCOUNT_VIEW": 1}},
    },
}

# Weekend activity multiplier - organizations are quieter on weekends.
WEEKEND_MULTIPLIER = 0.25
