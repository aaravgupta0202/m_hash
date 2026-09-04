import os
import json
import random
from datetime import datetime, timedelta

os.makedirs('data/static', exist_ok=True)
os.makedirs('data/active', exist_ok=True)

POST_CAPTIONS = [
  "Great team offsite this week 🎉", "Shipping something new soon…", "Coffee first, code later ☕",
  "Loved connecting with everyone at the summit", "Weekend hike recap", "Proud of what we built this quarter",
  "Throwback to the launch party", "New desk setup, finally!",
]

POST_IMAGES = [
  "/images/post_office.jpg",
  "/images/post_team.jpg",
  "/images/post_travel.jpg"
]

AVATAR_IMAGES = [
  "/images/avatar_1.jpg",
  "/images/avatar_2.jpg"
]

EMAIL_SUBJECTS = [
  "Q3 planning notes", "Re: Budget approval needed", "Weekly sync agenda", "Contract renewal - action required",
  "Team lunch on Friday?", "Invoice #4521 attached", "Project Atlas status update", "Following up on our call",
  "Holiday schedule reminder", "Access request approved",
]

TRANSACTION_MERCHANTS = [
  "Cloud Hosting Co.", "Office Supplies Ltd.", "Business Travel Inc.", "SaaS Subscription", "Client Payment Received",
  "Payroll Deposit", "Catering Services", "Conference Registration", "Software License", "Utility Payment",
]

NAMES = ["Sofia Alvarez", "Wei Zhang", "Jasmine Patel", "Hiro Tanaka", "Ravi Kumar", "Elena Rostova", "Chloe Dubois"]

def seeded_random(seed):
    s = [seed]
    def rand():
        s[0] = (s[0] * 16807) % 2147483647
        return (s[0] - 1) / 2147483646
    return rand

# SOCIAL
social_data = {"posts": [], "threads": {}}
r = seeded_random(42)
for i in range(8):
    social_data["posts"].append({
        "id": f"post-static-{i}",
        "author": NAMES[int(r() * len(NAMES))],
        "authorAvatar": AVATAR_IMAGES[int(r() * len(AVATAR_IMAGES))],
        "caption": POST_CAPTIONS[int(r() * len(POST_CAPTIONS))],
        "likes": int(r() * 180) + 5,
        "comments": int(r() * 20),
        "imageUrl": POST_IMAGES[int(r() * len(POST_IMAGES))]
    })

# GMAIL
gmail_data = {"emails": []}
r = seeded_random(11)
for i in range(12):
    has_attachment = r() > 0.6
    hours_ago = int(r() * 96)
    sender = NAMES[int(r() * len(NAMES))]
    gmail_data["emails"].append({
        "id": f"email-static-{i}",
        "from": sender,
        "fromEmail": sender.lower().replace(" ", ".") + "@northwind.com",
        "subject": EMAIL_SUBJECTS[int(r() * len(EMAIL_SUBJECTS))],
        "snippet": "Hi, just following up on this — let me know if you have any questions.",
        "unread": r() > 0.6,
        "hasAttachment": has_attachment,
        "attachmentName": f"document-{i}.pdf" if has_attachment else None,
        "attachmentSizeKb": int(r() * 300) + 40 if has_attachment else 0,
        "timestamp": (datetime.now() - timedelta(hours=hours_ago)).isoformat() + "Z"
    })

# FINANCE
finance_data = {"transactions": [], "beneficiaries": []}
r = seeded_random(13)
for i in range(10):
    is_credit = r() > 0.7
    hours_ago = int(r() * 240)
    finance_data["transactions"].append({
        "id": f"txn-static-{i}",
        "merchant": TRANSACTION_MERCHANTS[int(r() * len(TRANSACTION_MERCHANTS))],
        "amount": round((r() * 2400 + 20) * 100) / 100,
        "isCredit": is_credit,
        "timestamp": (datetime.now() - timedelta(hours=hours_ago)).isoformat() + "Z"
    })

r = seeded_random(17)
bene_names = ["Acme Vendor LLC", "Regional Tax Office", "Cloudline Partners", "J. Whitfield"]
for i in range(2 + int(r() * 2)):
    finance_data["beneficiaries"].append({
        "id": f"bene-static-{i}",
        "name": bene_names[i],
        "accountNumber": f"••••{1000 + int(r() * 8999)}"
    })

with open('data/static/social.json', 'w') as f:
    json.dump(social_data, f, indent=2)
with open('data/static/gmail.json', 'w') as f:
    json.dump(gmail_data, f, indent=2)
with open('data/static/finance.json', 'w') as f:
    json.dump(finance_data, f, indent=2)

print("Generated static data.")
