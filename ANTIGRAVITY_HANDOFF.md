# Handoff prompt for Antigravity — high-fidelity mock app rebuild

Copy everything below the line into Antigravity, pointed at this repo
(`c:\Users\aarav\Desktop\Work\m_hash`).

---

## Context

This repo is a working prototype called **Silent Shift — Security Behavior
Center**: a FastAPI + SQLAlchemy backend that detects behavioral drift
(compromised accounts, malicious insiders) across three mock applications,
and a React/TypeScript/Vite/Tailwind frontend with a SOC-style dashboard
plus three mock apps: Social (`/apps/social`), Gmail (`/apps/gmail`), and
Finance (`/apps/finance`).

The mock apps currently work but are intentionally minimal — a few tabs,
placeholder content, basic styling. Your job is to **rebuild the three mock
apps as much higher-fidelity, fully-featured clones** while leaving the
detection backend and the Security Center dashboard alone.

Read `README.md` first for the full architecture. The one thing that
matters most for your task:

> **Every meaningful user action in a mock app must call the existing event
> ingestion endpoint.** The security detection pipeline only ever reads
> from the unified `events` table — it has zero Instagram/Gmail/banking-
> specific code. If you don't wire an action to an event, it is invisible
> to the whole point of this product.

## Non-negotiable integration contract

1. **Do not modify** `backend/app/detection/`, `backend/app/context/`,
   `backend/app/scoring/`, or `backend/app/services/detection_runner.py`.
   That's the actual product; it's out of scope.
2. Every click that represents a real action (opening an email, viewing a
   profile, downloading an attachment, sending money, adding a card,
   creating a post, changing a setting, etc.) must call
   `frontend/src/services/api.ts` → `api.appEvent(application, {...})`,
   which hits `POST /api/apps/{social|gmail|finance}/event`. Reuse the
   existing hook `frontend/src/hooks/useActionRecorder.ts` — it already
   handles attaching the current user, current session device/location,
   and surfacing the resulting live risk score. Extend it if you need new
   parameters, but keep its contract (`record({ event_type, action,
   resource_id?, resource_type?, resource_sensitivity?, data_volume?,
   metadata? })`).
3. Keep using `frontend/src/hooks/CurrentUserContext.tsx` (the "signed in
   as" identity switcher across all 18 seeded users) and
   `frontend/src/hooks/SessionContext.tsx` (the device/location selector
   used to simulate a new device or unusual location). Don't replace the
   identity model with your own auth — there is no real auth here, by
   design.
4. **If you introduce a new `action`/`event_type` that doesn't already
   exist**, you must also register it in
   `backend/app/detection/config.py` (`SENSITIVE_ACTIONS` if it's
   security-relevant, e.g. a new money-movement or data-export action) and
   in `backend/seed/activity_profiles.py`'s `ACTION_CATALOG` (so seeded
   baseline history includes it and the new action doesn't look like a
   100%-unprecedented anomaly for every seeded user). Otherwise every
   seeded user will falsely light up the first time they touch your new
   feature. Prefer reusing the existing action vocabulary below unless a
   new feature genuinely has no equivalent.
5. Keep the routes stable: `/apps/social`, `/apps/gmail`, `/apps/finance`,
   rendered inside the existing `frontend/src/layouts/AppShell.tsx` (or a
   visually redesigned version of it — but keep the app-switcher, the
   "signed in as" selector, and the session device/location bar, since the
   Security Center's manual-testing story depends on them).
6. Don't touch anything under `frontend/src/pages/security/` or
   `backend/app/api/` (except the config/seed additions in point 4). The
   Security Center dashboard, alerts, investigation pages, and Simulation
   Center must keep working exactly as they do now, unmodified.
7. **Trademark/branding**: build faithful *interaction and layout* clones —
   the same information architecture, density, and interaction patterns
   users would recognize — but do not use the real Instagram or Gmail
   logo/wordmark assets or claim affiliation with Meta/Google anywhere in
   the UI or metadata. Use original names/marks (e.g. "Pulse" for the
   social app, "Northwind Mail" for the email app — pick your own) with
   your own logo treatment. This is an internal security-training
   prototype, not a public-facing product, and it must not be mistakable
   for the real services or usable for phishing.

## Existing event vocabulary (reuse these where possible)

```
SOCIAL:  LOGIN, PROFILE_VIEW, POST_CREATE, MESSAGE_SEND, MESSAGE_READ,
         CONTENT_DOWNLOAD, SETTINGS_CHANGE, FOLLOW_USER
GMAIL:   LOGIN, EMAIL_OPEN, EMAIL_SEARCH, EMAIL_SEND, ATTACHMENT_DOWNLOAD,
         FORWARDING_RULE_CREATED
FINANCE: LOGIN, ACCOUNT_VIEW, TRANSACTION_VIEW, BENEFICIARY_ADD,
         TRANSFER_CREATE, PROFILE_CHANGE
```

Resource sensitivity levels available: `PUBLIC`, `INTERNAL`,
`CONFIDENTIAL`, `RESTRICTED`. Use `data_volume` (a KB figure, even if
approximate) on anything that represents downloading/exporting/viewing a
meaningful chunk of data — it directly feeds the volume-anomaly detector.

## What to build

### 1. Social app ("Pulse" or your own name) — Instagram-fidelity clone

- **Feed**: stories row at top (avatars in gradient rings), scrollable post
  cards with multi-image carousel support, like/comment/share/save icons,
  double-tap-to-like interaction, real relative timestamps.
- **Explore**: a responsive photo grid (masonry or square grid).
- **Reels**: a vertical full-bleed scroller (can be simple looping color/
  gradient placeholders — no real video needed).
- **Profile**: cover stats row (posts/followers/following), bio, grid of
  the user's own posts, a "tagged" tab, follow/message buttons when
  viewing someone else's profile (→ `PROFILE_VIEW` event).
- **Direct messages**: conversation list + thread view with read receipts
  and a typing-indicator feel; sending fires `MESSAGE_SEND`, opening a
  thread fires `MESSAGE_READ`.
- **Notifications** tab (likes/follows/comments feed — cosmetic, no event
  needed unless you add a "mark all read" settings-style action).
- **Settings**: account privacy, notification prefs, connected devices
  list (pulls from the same backend device data the Security Center
  shows), each toggle fires `SETTINGS_CHANGE` with `metadata: {field,
  value}`.
- Every post's "download image" action should fire `CONTENT_DOWNLOAD`
  with a realistic `data_volume`.

### 2. Email app ("Northwind Mail" or your own name) — Gmail-fidelity clone

- **Three-pane layout**: left rail (Compose button, Inbox/Starred/Sent/
  Drafts/Spam/Trash, custom labels), middle thread list, right reading
  pane (or full-width thread view on click, your call).
- **Thread list**: sender, subject, snippet, attachment paperclip icon,
  relative time, unread bold state, hover actions (archive/delete/mark
  read — cosmetic unless you want `SETTINGS_CHANGE`-style events for
  them), category tabs (Primary/Social/Promotions) purely visual.
- **Reading pane**: full thread with quoted history collapsed/expanded,
  attachment chips that trigger `ATTACHMENT_DOWNLOAD` with the file's
  `resource_sensitivity` set per file type (financial/contract docs →
  `CONFIDENTIAL`, most things → `INTERNAL`).
- **Compose**: bottom-right floating modal (like real Gmail), minimize/
  expand, send fires `EMAIL_SEND`.
- **Search**: a real filter-as-you-type over the mock inbox, fires
  `EMAIL_SEARCH` with `metadata: {query, result_count}` on submit.
- **Settings**: tabbed (General, Labels, Forwarding & POP/IMAP, Devices).
  The forwarding tab is the important one — adding a forwarding address
  fires `FORWARDING_RULE_CREATED` with `resource_sensitivity: "RESTRICTED"`
  (this exact action is central to the compromised-account demo scenario;
  don't change its semantics). Devices tab can just display the user's
  known devices from the backend (`GET /api/users/{id}` → `devices`).

### 3. Banking app ("Northwind Bank" or your own name) — a *proper* banking UI, not just a balance card

- **Dashboard**: multiple accounts (checking, savings, credit card) as
  distinct cards with balances, a net-worth/spending summary chart
  (Recharts, matching the existing dashboard's chart style), quick actions
  (transfer, pay a bill, lock card).
- **Transactions**: full ledger with search, category filter, date-range
  filter, and a spending-by-category breakdown chart. Opening the list/
  a transaction detail fires `TRANSACTION_VIEW`.
- **Transfers**: a proper multi-step flow — choose account → choose/add
  beneficiary → amount + memo → review/confirm → success screen. Adding a
  beneficiary fires `BENEFICIARY_ADD` (`resource_sensitivity: "RESTRICTED"`);
  confirming the transfer fires `TRANSFER_CREATE` with `metadata: {amount}`.
  Don't let either of those fire on an intermediate step — only on final
  confirmation, exactly once.
- **Cards**: view card (masked number), freeze/unfreeze toggle, request
  replacement — these can fire `PROFILE_CHANGE` or a settings-style event;
  pick one and be consistent.
- **Bill pay**: list of payees, schedule a payment (can reuse
  `TRANSFER_CREATE` semantics if you don't want a new action type).
- **Statements**: list of monthly PDFs (cosmetic is fine) with a
  "download" button that fires `CONTENT_DOWNLOAD`-equivalent — since that
  action type isn't in the Finance vocabulary, either reuse
  `TRANSACTION_VIEW` with a larger `data_volume`, or add a new
  `STATEMENT_DOWNLOAD` action and register it per constraint #4 above.
- **Settings/security**: profile info (`PROFILE_CHANGE`), plus a device/
  login-history tab pulling from the same backend device data.

## Design direction

Both Instagram and Gmail have very well-known, dense, specific layouts —
match their information architecture and interaction feel closely. Use
Tailwind (already installed) or swap in a component library if you prefer,
but keep bundle size reasonable. Reuse `frontend/src/lib/style.ts`'s CSS
variables for anything that needs to stay visually consistent with the
Security Center (e.g. the risk toast that already pops up after actions,
in `frontend/src/components/ActivityToast.tsx` — keep that working, it's
how a demo audience sees "this click just got recorded").

## Acceptance criteria

- `cd frontend && npm run build` succeeds with no TypeScript errors.
- `cd backend && python -m pytest tests/ -q` still passes unmodified
  (proves you didn't touch detection logic).
- Clicking through each new app as different seeded users (via "signed in
  as") produces events visible in the Security Center's Events/Timeline
  pages, and a sustained pattern of unusual actions still produces a risk
  increase and eventually an alert — i.e., re-run through the existing
  "Compromised Account" and "Malicious Insider" simulations from
  `/security/simulations` afterward and confirm they still tell the same
  story they did before your changes.
- No real Instagram/Gmail logos, wordmarks, or brand claims anywhere.
