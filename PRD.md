# tellTale — Demo Console PRD

**Product:** tellTale — context-aware behavioural transition detection
**Artifact:** static, single-page-app showcase console
**Owner:** Team 001 (Manipal Hackathon 2026, Round 1, Cybersecurity)
**Status:** for build
**Version:** 1.0

---

## 1. What this is, and what it is not

This is a **showcase build**. Its only job is to make a three-minute video look like a real
security product and to survive a judge clicking around for two minutes afterwards.

**It is:** a static frontend with every byte of data hardcoded in TypeScript fixture files.
**It is not:** the product. No backend, no database, no API calls, no auth, no ML at runtime.

Every number the interface displays — risk scores, transition probabilities, Z-scores, cohort
medians — is a literal in a fixture file, precomputed to be internally consistent. The detection
engine described in the master document is *not* implemented here and must not be faked with
live computation. Consistency is authored, not calculated.

### Why static

- Deploys to any static host or runs from `file://`-adjacent `next start`. No venue wifi dependency.
- Nothing can fail live: no request can time out mid-demo.
- The judge's GitHub link works without them provisioning anything.

### Non-goals (do not build)

1. Any backend, API route, server action, or database.
2. Real OAuth, real connectors, or any outbound network request.
3. A working detection engine. Scores are fixtures.
4. User accounts, login, roles, or permissions.
5. Mobile-first layout. Desktop 1440×900 is the target; degrade gracefully, don't optimise.
6. Dark mode. One theme, done well.
7. Productivity metrics of any kind — see §7.

---

## 2. Success criteria

The build is done when all of these are true:

- [ ] `npm run build` produces a static export with zero errors and zero runtime data fetching.
- [ ] Every route loads in under 400ms on a cold local server.
- [ ] The three demo scenarios (Priya, Marcus, Dana) are each reachable in **one click** from the
      queue, and each tells its story without the presenter needing to explain the UI.
- [ ] A visitor who has never seen the product can state what tellTale does after 60 seconds on
      the dashboard.
- [ ] No lorem ipsum, no `TODO`, no placeholder avatars, no empty states visible on the happy path.
- [ ] Nothing on screen displays a real person's name from the team or from any real company.

---

## 3. The story the interface must tell

Ordered. Every screen exists to serve one of these beats.

| # | Beat | Screen |
|---|------|--------|
| 1 | Security tools drown analysts in alerts that are mostly normal work | Dashboard — suppression stats |
| 2 | tellTale ranks a short, costed queue instead | Queue |
| 3 | The same command from three people gets three correct, different answers | Queue → three subjects |
| 4 | Priya is suppressed because her org authorised the work | Investigation (Priya) |
| 5 | Marcus is critical because nothing authorised it and he's leaving | Investigation (Marcus) |
| 6 | Dana forged her own authorisation — and that attempt is itself detected | Investigation (Dana) |
| 7 | Every score decomposes into exact contributions; nothing is a black box | Investigation → Why it scored |
| 8 | We know when our own telemetry goes dark | Connector health |
| 9 | Suppressions are logged, not discarded — the claim is auditable | Suppression log |

---

## 4. Information architecture

The app has **two modules** with a visible switch between them in the sidebar. This separation is a
product requirement, not a navigation convenience — see §7.

```
RISK MODULE (pseudonymous subjects)
/                       Dashboard
/queue                  Investigation queue (ranked)
/subject/[id]           Investigation view  — the centrepiece
/connectors             Connector health / heartbeat
/suppressions           Suppression log

WORKFORCE MODULE (named employees)
/workforce              Org summary — working time, activity, coverage
/workforce/[id]         Member day view — timeline, usage, captures
/workforce/usage        Application & website usage by category
/workforce/captures     Screen capture gallery with tag and flag

/about                  What this is, what is fixture, and the module separation
```

The module switch shows the active role as a chip: `SECURITY ANALYST` or `WORKFORCE ADMIN`. Switching
shows a one-line interstitial: *"Crossing modules is an audited action. In production this requires both
role grants."* It then proceeds — this is a demo, and the point is to make the control visible, not to
block the presenter mid-video.

Persistent left sidebar with the tellTale wordmark, nav, and a build badge reading
`DEMO BUILD — ALL DATA SYNTHETIC`. That badge is non-negotiable: it is an honesty signal and
judges notice it.

Top bar on every page: the universal filter triple — **Cohort** select, **Subject** select,
**Date range** — rendered as real controls. Cohort and subject filter the queue for real;
date range is display-only and pinned to a single synthetic day.

---

## 5. Screens

### 5.1 Dashboard (`/`)

Purpose: establish the problem and the scale in ten seconds.

**Row 1 — four stat tiles**

| Tile | Value | Sub-label |
|---|---|---|
| Events ingested | `1,284,402` | last 30 days, 6 connectors |
| Alerts suppressed by context | `1,847` | 84% of raised anomalies |
| Reached an analyst | `23` | ranked, with evidence |
| Confirmed findings | `3` | 2 insider, 1 session theft |

The narrative is in the descent: a million events → three findings.

**Row 2 — two panels**

- *Left:* "Where the noise went" — a horizontal stacked bar. Segments, left to right:
  Scope-matched ticket (52%), On-call rotation (18%), Approved travel (7%), Role change (7%),
  Below threshold (13%), **Escalated (3%)**. Escalated is the accent colour; everything else is
  muted. Hovering a segment shows count and reason code.
- *Right:* "Risk over the last 30 days" — a line chart, mostly flat, with three labelled spikes
  corresponding to the three subjects. Clicking a spike navigates to that subject.

**Row 3 — connector strip**

Six chips (Okta, Google Workspace, GitHub, AWS CloudTrail, Jira, Workday) each showing a green
dot and last-heartbeat time — except **AWS CloudTrail, which is amber with `last seen 00:47:12 ago`**.
This is deliberate: it seeds the connector-health story and gives the demo somewhere to go.

### 5.2 Queue (`/queue`)

A ranked table. Columns:

`Rank · Subject (pseudonym) · Cohort · Risk · Expected cost · Top signal · Context · Age · Status`

- Subject renders as `#4912` with a small `identity class` glyph (human / service / agent).
- Risk is a number 0–100 with a coloured bar behind it.
- Expected cost is risk × asset criticality, shown as a bar — and **the sort order is by expected
  cost, not risk**, so row 2 has a higher raw risk than row 1. A footnote explains this in one
  line. That inversion is the single most interesting thing on the page.
- Context column shows one of four chips: `AUTHORISED` (green), `PARTIAL` (grey),
  `ABSENT` (amber), `SUSPICIOUS` (red).
- A horizontal rule after row 7 labelled **"Today's triage capacity — 6 analyst-hours"**.
  Rows below it render at 60% opacity. Nothing is hidden; it just isn't pretending to be actionable.

Include 14 rows. Marcus (#4912) and Dana (#2071) are above the line. Priya (#8830) does **not**
appear — she was suppressed, and a link at the top reads "1,847 suppressed today — view log".

### 5.3 Investigation (`/subject/[id]`) — the centrepiece

Spend 60% of build effort here. Vertical sections:

**A. Header.** Pseudonym, cohort, identity class, calibrated risk as a large number with a
verdict chip, and three action buttons: `Revoke sessions`, `Restrict tokens`, `Request unmasking`.
All three open a modal that explains what would happen and says
*"Disabled in demo build — this would call the connector."* Do not wire them to anything.

**B. Composite timeline.** The most important component in the build. Four horizontal lanes
sharing one hour axis (00:00–23:59):

1. `SESSION` — authentication events as ticks; ASN changes marked and coloured.
2. `TRAJECTORY` — action events as ticks, coloured by resource sensitivity.
3. `CONTEXT` — bars spanning the periods where an authorising record was in force.
4. `RISK` — a filled area chart of the calibrated score through the day.

The story is visual: on Marcus's page the CONTEXT lane is **empty** exactly where the
TRAJECTORY lane is busiest, and the RISK lane climbs there. On Priya's, the CONTEXT bar spans
her whole active period. A presenter should be able to point at this and say nothing.

Hovering any tick shows a tooltip with timestamp, action, resource. A vertical crosshair tracks
the cursor across all four lanes.

**C. Why it scored.** A table of contribution rows: `Feature · Evidence · Contribution to logit`,
with a horizontal bar per row (red = raises risk, green = lowers). Ends with a summary row:
`calibrated P(malicious) = 0.93`. The contributions must sum correctly to the stated logit — check
the arithmetic in the fixtures.

**D. Context verification.** Four rows — Precedence, Provenance, Scope match, Proportionality —
each with pass/fail/warn, the specific record examined, and a one-line finding. On Dana's page,
Precedence passes and Provenance fails, and the failure line reads
*"Created by subject_2071 — the subject of this investigation."* That line is the demo's punchline.

**E. Attack path.** A left-to-right node graph of the trajectory (Okta → GitHub → archive →
external S3). Node fill indicates sensitivity; the anomalous edge is highlighted with its
transition probability as an edge label (`P = 0.0004`). Use React Flow, non-interactive except
for hover tooltips, fixed layout — do not use auto-layout, hand-position the nodes.

**F. Cohort comparison.** A small beeswarm or strip plot: cohort members as dots on a metric
axis, the subject as a distinct marker far to the right. Caption states the comparison in words:
*"17 cohort members cloned a new repository in 90 days. 17 of 17 had an authorising ticket.
0 of 17 uploaded outside org accounts."*

**G. Evidence.** A list of collected artefacts with tag and flag affordances per row. Flagging
opens a reason-code picker. State is in React state only and resets on reload — that is fine
and expected.

### 5.4 Connector health (`/connectors`)

Two parts, mirroring a pattern that works well in production monitoring tools:

- **Instance table:** `Source · Type (online/offline) · Timestamp · Events in window · Expected band`.
  Twelve rows across the day for six connectors.
- **Continuous ribbon:** one horizontal bar per connector across a 24-hour axis, green where
  healthy, amber where degraded, red where silent. AWS CloudTrail has a red segment from 19:12.

Below: a callout explaining why this screen exists — *an attacker who disables a log source
produces silence, and silence is a signal. Absence of data is monitored as actively as data.*

### 5.5 Suppression log (`/suppressions`)

A filterable table: `Time · Subject · Anomaly · Suppressed by · Reason code · Reviewable`.
Around 40 rows. Filter chips across the top by reason code.

Header states: **"Suppressed, not discarded."** Every row expands to show the exact context
record that caused suppression, including who created it and when. One row is marked
`UNDER REVIEW` — a suppression later found to rest on manufactured context, linking to Dana.
That link closes the loop on the whole argument.

### 5.6 Workforce module

The second module. Named employees, no risk scores. Build it after the risk module is complete.

**`/workforce` — org summary.** Four stat tiles (people monitored, Sensor coverage %, captures today,
active connectors), a per-member table with working time, idle time, top application and last seen, and a
24-hour activity ribbon per member.

**`/workforce/[id]` — member day view.** The screen a workforce admin actually uses:
- Timeline summary ribbon across the working day, green for active and blue for idle
- Working/idle hours table by hour slot
- A donut of time by application category (development, browser, communication, file management,
  administrative) — **labelled "time by category", never "productivity"**, see §7
- Application and window-title list with durations
- Capture strip for the day, thumbnails at 5-minute cadence

**`/workforce/usage`** — category and application breakdown with an hourly top-application table.

**`/workforce/captures`** — a paged gallery. Each thumbnail carries the member name, timestamp, and tag
and flag controls. A `Flagged only` filter. Thumbnails are **synthetic placeholder images** — generated
gradients or blurred abstract panels with a mock window chrome — never real screenshots of anything.

### 5.7 About (`/about`)

Short and honest. What tellTale is, the team, and an explicit table: **what is real** (the
detection design, the mathematics, the architecture — link the master document) versus
**what is fixture** (all data, all scores, all connector state). Judges reward this; hiding it
risks the opposite.

---

## 6. Fixture data

All fixtures live in `/lib/fixtures/` as typed TypeScript. No JSON fetched at runtime.

```ts
type IdentityClass = 'human' | 'service' | 'agent';
type ContextVerdict = 'authorised' | 'partial' | 'absent' | 'suspicious';

interface Subject {
  id: string;              // 'subject_4912'
  pseudonym: string;       // '#4912'
  cohort: string;          // 'Backend Engineering'
  cohortSize: number;
  identityClass: IdentityClass;
  tenureDays: number;
  risk: number;            // 0..100, calibrated
  expectedCost: number;    // risk x assetCriticality
  verdict: ContextVerdict;
  topSignal: string;
  status: 'new' | 'triaging' | 'suppressed' | 'confirmed';
}

interface TimelineEvent {
  ts: string;              // ISO, all on 2026-09-14
  lane: 'session' | 'trajectory' | 'context' | 'risk';
  action: string;          // canonical token, e.g. 'github.repo.clone'
  resource?: string;
  sensitivity: 'low' | 'medium' | 'high' | 'critical';
  note?: string;
  firstEver?: boolean;
}

interface Contribution {
  feature: string;
  evidence: string;
  logit: number;           // signed; must sum to the stated total
}

interface ContextCheck {
  test: 'precedence' | 'provenance' | 'scope' | 'proportionality';
  result: 'pass' | 'fail' | 'warn';
  recordId?: string;
  createdBy?: string;
  createdAt?: string;
  finding: string;
}
```

**Sensor coverage:** mark 72 of the 100 subjects as Sensor-equipped. The remaining 28 are cloud-only,
and their investigation pages must visibly omit presence divergence and composition drift with a short
note — *"Sensor not deployed on this identity; two detectors unavailable."* This shows the tiering is real
rather than decorative, and it is a good answer when a judge asks what the agent actually buys.

**Population:** 100 subjects, of which 14 appear in the queue. Generate the other 86 with a
seeded helper so cohort comparisons have real distributions — but commit the output as a static
array, don't randomise at runtime or the numbers change between the video and the live demo.

**Pseudonyms only.** No subject anywhere in the app has a human name. The three scenarios are
`#8830`, `#4912`, `#2071`; "Priya", "Marcus" and "Dana" are presenter shorthand and appear
**only** in the demo-scenario launcher labels, never in the investigation UI. This is the
pseudonymisation architecture being visible rather than claimed.

**Arithmetic consistency is mandatory.** Before committing fixtures, verify: contributions sum to
the logit; the logit maps through the logistic function to the stated probability; the stated
probability × 100 equals the displayed risk; Z-scores are consistent with the cohort median and
MAD shown. A judge who checks and finds a mismatch has found the one thing that discredits the
"no black box" claim.

---

## 7. Hard content constraints

Derived from the product's own positioning. Violating any of these makes the demo argue against the
pitch — and the first two are the ones a judge is most likely to probe.

1. **The two modules never mix on one screen.** No risk score appears anywhere in the workforce module.
   No employee name appears anywhere in the risk module. There is no link from a subject to their
   workforce profile — crossing is the dual-custody unmasking flow, and in the demo that means a modal
   explaining what would happen, not a navigation.
2. **No productivity classification anywhere.** Time by category is fine and is real telemetry. Labelling
   a category "productive" or "unproductive", computing a productivity score, or ranking members by output
   is not. The product's position is that composition is a behavioural fact and productivity is a
   management judgement that must not touch a risk model; the demo has to show that distinction, not blur
   it.
3. **No real names** on risk subjects. Pseudonyms throughout the risk module. Workforce module uses
   synthetic names that belong to no real person and match no team member.
4. **No real screenshot imagery.** Capture thumbnails are generated placeholders. Never ship an image of
   anyone's actual screen, including your own.
5. **No message or file content.** Window titles and resource paths are fine — that is metadata. Message
   bodies, file contents and typed text are not, and must not appear even as mock data.
6. **Unmasking is always a two-approval flow**, shown as such, never a single button.
7. **No claimed accuracy figures.** Do not display AUROC, "99% accurate", or similar anywhere. The About
   page may state that evaluation is pending.
8. **The jurisdiction profile is visible.** A chip in the sidebar reads `PROFILE: FULL (INDIA/US)` with a
   tooltip listing what that profile enables and what the EU profile would disable. It is one component and
   it answers the compliance question before it is asked.

---

## 8. Visual design

**Palette** — carry the identity from the deck and document:

```
ink        #1B1233   primary text
purple     #351C75   primary brand, headers, active nav
purple-dk  #20124D   dark surfaces
purple-lt  #F0ECF8   tinted panels
green      #0E8A5F   suppressed, healthy, contributions that lower risk
amber      #A96A0C   partial, degraded, warn
red        #A82219   critical, absent context, contributions that raise risk
grey       #6C6C7D   secondary text
line       #DBD5EC   borders
white      #FFFFFF   page background
```

Purple dominates. Red is used sparingly and only where something is genuinely wrong — if three
things on screen are red, none of them reads as urgent.

**Type:** one sans family throughout (Inter or the system stack). Monospace (JetBrains Mono or
`ui-monospace`) for timestamps, action tokens, resource identifiers, probabilities, and anything
that is machine output. The mono/sans distinction should map exactly onto
*machine-generated vs human-written* — that is the whole typographic system and it does a lot of
work in a security tool.

**Density:** this is an analyst tool, not a landing page. Tighter than a marketing site, generous
line-height in prose blocks. 8px spacing scale. Cards are 1px bordered with a small radius, not
shadowed — shadows read as consumer.

**Motion:** almost none. Risk bars animate width on mount (200ms). Nothing else moves. Loading
skeletons are unnecessary; the data is local.

---

## 9. Technical constraints

- **Next.js 16 App Router**, TypeScript strict, `output: 'export'`.
- **Tailwind CSS** + **shadcn/ui** for primitives. No custom component library.
- **Recharts** for the line, area, and stacked bar charts.
- **React Flow** for the attack path only.
- The composite timeline is **hand-built SVG**, not a chart library. Four lanes with a shared
  scale is not a chart-library shape, and fighting one will cost more than writing it.
- No `localStorage`, no cookies, no service worker.
- All routes statically generated. `generateStaticParams` for `/subject/[id]`.
- Lighthouse performance ≥ 95 on a local build.

---

## 10. Demo scenario launcher

A small fixed control, bottom-right, present on every page: three buttons labelled
**Priya — suppressed**, **Marcus — compromised**, **Dana — manufactured context**. Each navigates
directly to the corresponding investigation view.

This exists so the presenter never navigates during the video. It is the single highest-value
piece of demo insurance in the build, and it is three lines of code.

---

## 11. Build order

Each step unblocks the next. Do not jump ahead.

1. Scaffold, Tailwind, shadcn/ui, palette tokens, sidebar shell with module switch, all routes stubbed.
2. Fixtures — all of them, with the arithmetic verified. Nothing downstream is real until this is.
3. Queue table. Simplest screen that proves the fixtures are right.
4. Investigation: header + contributions + context checks. Static, no charts yet.
5. Composite timeline SVG. Budget the most time here.
6. Attack path, cohort comparison, evidence list.
7. Dashboard.
8. Connectors, suppression log.
9. Workforce module — org summary, member day view, usage, captures.
10. About page, demo launcher, responsive tidy-up, build and deploy.

---

## 12. Acceptance checklist

- [ ] Three scenarios reachable in one click from anywhere
- [ ] Contribution values sum to the stated logit on all three investigation pages
- [ ] Marcus's CONTEXT lane is visibly empty where his TRAJECTORY lane is busiest
- [ ] Dana's Provenance check names the subject as the record's creator
- [ ] Queue sort order is by expected cost and visibly differs from risk order
- [ ] Triage capacity line is present and rows below it are de-emphasised
- [ ] AWS CloudTrail shows degraded on both dashboard and connectors page
- [ ] Suppression log contains one `UNDER REVIEW` row linking to Dana
- [ ] `DEMO BUILD — ALL DATA SYNTHETIC` badge visible on every page
- [ ] No employee name anywhere in the risk module; no risk score anywhere in the workforce module
- [ ] No productivity classification anywhere; category views are labelled "time by category"
- [ ] Cloud-only subjects visibly omit the two Sensor detectors with an explanatory note
- [ ] Jurisdiction profile chip present in the sidebar with a working tooltip
- [ ] Capture thumbnails are generated placeholders, not real screen imagery
- [ ] No accuracy claim anywhere in the app
- [ ] `npm run build` clean; static export serves correctly from a plain file server
