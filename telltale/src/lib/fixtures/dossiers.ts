import type { Dossier } from "./types";
import { BACKEND_PEERS } from "./population";

/**
 * The three authored scenarios. Every number here is a literal, chosen so the
 * chain closes exactly (scripts/verify-fixtures.mjs asserts all of it):
 *
 *   Σ contributions = logitTotal   →   σ(logitTotal) = probability
 *   round(probability × 100) = risk
 *   zScore = (subjectValue − cohort median) / (1.4826 × cohort MAD)
 *
 * One intercept is shared by all three subjects, and by the twelve generated
 * queue dossiers, because a logistic model has one intercept. β₀ = −1.90 gives
 * σ(−1.90) = 13.0%, a prior over SCORED IDENTITIES read straight off the
 * dashboard: 3 confirmed findings from 23 investigations in 30 days is 13.0%.
 * A much more negative intercept would force every benign-but-authorised
 * subject to carry implausible anomaly mass simply to reach its own displayed
 * score, which is how a contribution table ends up contradicting itself.
 *
 * NOTE ON THE MASTER DOCUMENT: §1.9 prints Marcus's contributions summing to
 * +9.70 alongside a calibrated 0.93. Those two cannot both be true under
 * σ(Σ) — σ(9.70) = 0.9999. The master document resolves it with an isotonic
 * calibration step (§2.7) between the raw sum and the displayed probability.
 * The PRD instead requires the displayed chain to close directly (§6), and the
 * PRD governs this build. So the features and evidence strings below are the
 * master document's; the coefficients have been refitted so a judge with a
 * calculator finds σ(Σ) = the printed probability. Master doc §2.6 already
 * describes these as "initial values fitted on the simulator, not universal
 * constants", so refitting them is in character.
 *
 * Context terms γ are the master doc §2.6 values, unchanged:
 *   authorised −2.60 · partial −1.10 · absent 0.00 · suspicious +2.20
 */

const INTERCEPT_EVIDENCE =
  "Prior over scored identities — 3 of 23 investigations confirmed in 30d";

/** 17 of the 33 Backend Engineering peers cloned a new repository in 90 days. */
const COHORT_CAPTION_SHARED =
  "17 cohort members cloned a new repository in the last 90 days. 17 of 17 had an authorising ticket. 0 of 17 uploaded outside org accounts.";

/* ------------------------------------------------------------ #8830 Priya */

const priya: Dossier = {
  subjectId: "subject_8830",
  verdictLabel: "SUPPRESSED",
  logitTotal: -1.82,
  probability: 0.14,
  risk: 14,
  headline:
    "First-ever access to a critical repository, fully covered by an authorising record created a day earlier by another identity.",
  contributions: [
    {
      feature: "Base rate (intercept)",
      evidence: INTERCEPT_EVIDENCE,
      logit: -1.9,
    },
    {
      feature: "Resource novelty",
      evidence: "payments-core — first access in 180d, no prior commit history",
      logit: 1.35,
    },
    {
      feature: "Trajectory surprisal",
      evidence:
        "P(github.pr.open | github.repo.clone) = 0.38 — the modal developer path",
      logit: 0.62,
    },
    {
      feature: "Composition drift",
      evidence:
        "JSD 0.11 vs 60–90d anchor — development share up 9pp, net of cohort",
      logit: 0.43,
    },
    {
      feature: "Employment signal",
      evidence: "Active; internal transfer recorded 12d ago (Workday)",
      logit: 0.28,
    },
    {
      feature: "Volumetric deviation",
      evidence: "9 resources vs cohort median 12 (MAD 4) — robust Z = -0.51",
      logit: 0,
    },
    {
      feature: "Cohort divergence",
      evidence: "D = -0.08 against the frozen anchor, net of cohort movement",
      logit: 0,
    },
    {
      feature: "Geo / ASN novelty",
      evidence: "Corporate ASN, 214 sessions in 180d",
      logit: 0,
    },
    {
      feature: "Presence divergence",
      evidence: "Endpoint reported active for all 5 authenticated actions",
      logit: 0,
    },
    {
      feature: "Context verification",
      evidence:
        "AUTHORISED — precedence, provenance, scope and proportionality all pass",
      logit: -2.6,
    },
  ],
  checks: [
    {
      test: "precedence",
      result: "pass",
      recordId: "TICKET-4471",
      createdAt: "2026-09-13T09:12:00Z",
      finding:
        "Record precedes the activity by 25h 03m. Configured minimum lead is 30m.",
    },
    {
      test: "provenance",
      result: "pass",
      recordId: "TICKET-4471",
      createdBy: "subject_5530",
      finding:
        "Assigned by subject_5530 — an identity other than the subject. Full weight.",
    },
    {
      test: "scope",
      result: "pass",
      recordId: "TICKET-4471",
      finding:
        "scope_refs resolves payments-core through the repository → service map. Exact match.",
    },
    {
      test: "proportionality",
      result: "pass",
      finding:
        "9 resources against a scope of one service. Below the 95th percentile for this work class.",
    },
  ],
  comparison: {
    metric: "Distinct resources touched",
    caption: COHORT_CAPTION_SHARED,
    subjectValue: 9,
    stats: BACKEND_PEERS,
    zScore: -0.51,
  },
  attackPath: {
    nodes: [
      {
        id: "okta",
        label: "okta.session.start",
        sublabel: "Corporate ASN · Bengaluru",
        sensitivity: "low",
        x: 0,
        y: 60,
      },
      {
        id: "clone",
        label: "github.repo.clone",
        sublabel: "payments-core · first ever",
        sensitivity: "critical",
        x: 210,
        y: 60,
      },
      {
        id: "branch",
        label: "github.branch.create",
        sublabel: "fix/ledger-rounding",
        sensitivity: "medium",
        x: 420,
        y: 60,
      },
      {
        id: "pr",
        label: "github.pr.open",
        sublabel: "#2244 · review requested",
        sensitivity: "low",
        x: 630,
        y: 60,
      },
    ],
    edges: [
      { from: "okta", to: "clone", probability: 0.34 },
      { from: "clone", to: "branch", probability: 0.52 },
      { from: "branch", to: "pr", probability: 0.38 },
    ],
  },
  evidence: [
    {
      id: "ev-p1",
      ts: "2026-09-14T09:06:12Z",
      kind: "Identity",
      detail: "okta.session.start — ASN 24560, device enrolled 2025-11-04",
      source: "Okta",
    },
    {
      id: "ev-p2",
      ts: "2026-09-13T09:12:00Z",
      kind: "Context record",
      detail: "TICKET-4471 — scope payments-core, assigned by subject_5530",
      source: "Jira",
    },
    {
      id: "ev-p3",
      ts: "2026-09-14T10:15:41Z",
      kind: "Action",
      detail: "github.repo.clone — payments-core",
      source: "GitHub Enterprise",
    },
    {
      id: "ev-p4",
      ts: "2026-09-14T11:04:55Z",
      kind: "Action",
      detail: "github.pr.open — #2244",
      source: "GitHub Enterprise",
    },
    {
      id: "ev-p5",
      ts: "2026-09-14T10:15:41Z",
      kind: "Presence",
      detail: "Endpoint active; window focus on Visual Studio Code",
      source: "Sensor",
    },
    {
      id: "ev-p6",
      ts: "2026-09-14T10:15:41Z",
      kind: "Suppression record",
      detail: "sup-000 — SCOPE_MATCHED_TICKET, retained and queryable",
      source: "tellTale",
    },
  ],
};

/* ----------------------------------------------------------- #4912 Marcus */

const marcus: Dossier = {
  subjectId: "subject_4912",
  verdictLabel: "CRITICAL",
  logitTotal: 2.59,
  probability: 0.93,
  risk: 93,
  headline:
    "Four-step exfiltration trajectory across 3 platforms in a 28-minute window, with no operational context authorising any part of it.",
  contributions: [
    {
      feature: "Base rate (intercept)",
      evidence: INTERCEPT_EVIDENCE,
      logit: -1.9,
    },
    {
      feature: "Trajectory surprisal",
      evidence:
        "P(aws.s3.put_object | github.archive.create) = 0.0004 in this organisation",
      logit: 1.42,
    },
    {
      feature: "Employment signal",
      evidence:
        "Voluntary resignation filed 4d ago (Workday), effective in 10d",
      logit: 1.05,
    },
    {
      feature: "Novel egress path",
      evidence:
        "External S3 bucket outside org accounts — no prior instance in 180d",
      logit: 0.83,
    },
    {
      feature: "Volumetric deviation",
      evidence: "410 resources vs cohort median 12 (MAD 4) — robust Z = +67.11",
      logit: 0.62,
    },
    {
      feature: "Geo / ASN novelty",
      evidence:
        "Unseen ASN 51167 (commercial VPN, Zurich); implied travel 4.1h",
      logit: 0.38,
    },
    {
      feature: "Presence divergence",
      evidence: "3 authenticated actions while the endpoint reported locked",
      logit: 0.19,
    },
    {
      feature: "Context verification",
      evidence: "ABSENT — no authorising record found in any context source",
      logit: 0,
    },
  ],
  checks: [
    {
      test: "precedence",
      result: "fail",
      finding:
        "No context record exists for this window in Jira, PagerDuty, Workday or calendar.",
    },
    { test: "provenance", result: "fail", finding: "No record to attribute." },
    {
      test: "scope",
      result: "fail",
      finding: "No record to resolve against payments-core.",
    },
    {
      test: "proportionality",
      result: "fail",
      finding:
        "410 resources exceeds the 95th percentile for every work class in this cohort.",
    },
  ],
  comparison: {
    metric: "Distinct resources touched",
    caption: COHORT_CAPTION_SHARED,
    subjectValue: 410,
    stats: BACKEND_PEERS,
    zScore: 67.11,
  },
  attackPath: {
    nodes: [
      {
        id: "okta",
        label: "okta.session.start",
        sublabel: "ASN 51167 · Zurich · first in 180d",
        sensitivity: "medium",
        x: 0,
        y: 60,
      },
      {
        id: "clone",
        label: "github.repo.clone",
        sublabel: "payments-core · first ever",
        sensitivity: "critical",
        x: 210,
        y: 60,
      },
      {
        id: "archive",
        label: "github.archive.create",
        sublabel: "bundle.tar.gz · 410 files",
        sensitivity: "critical",
        x: 420,
        y: 60,
      },
      {
        id: "s3",
        label: "aws.s3.put_object",
        sublabel: "External bucket · outside org accounts",
        sensitivity: "critical",
        x: 630,
        y: 60,
      },
    ],
    edges: [
      { from: "okta", to: "clone", probability: 0.31 },
      { from: "clone", to: "archive", probability: 0.07 },
      { from: "archive", to: "s3", probability: 0.0004, anomalous: true },
    ],
  },
  evidence: [
    {
      id: "ev-m1",
      ts: "2026-09-14T01:14:03Z",
      kind: "Identity",
      detail: "okta.session.start — ASN 51167, commercial VPN, Zurich",
      source: "Okta",
    },
    {
      id: "ev-m2",
      ts: "2026-09-14T01:18:20Z",
      kind: "Identity",
      detail:
        "okta.mfa.challenge — push approved, device fingerprint unrecognised",
      source: "Okta",
    },
    {
      id: "ev-m3",
      ts: "2026-09-14T01:22:47Z",
      kind: "Action",
      detail: "github.repo.clone — payments-core",
      source: "GitHub Enterprise",
    },
    {
      id: "ev-m4",
      ts: "2026-09-14T01:35:11Z",
      kind: "Action",
      detail: "github.archive.create — bundle.tar.gz, 410 files",
      source: "GitHub Enterprise",
    },
    {
      id: "ev-m5",
      ts: "2026-09-14T01:42:02Z",
      kind: "Action",
      detail: "aws.s3.put_object — bucket outside org account boundary",
      source: "AWS CloudTrail",
    },
    {
      id: "ev-m6",
      ts: "2026-09-10T16:04:00Z",
      kind: "Employment",
      detail:
        "Lifecycle event — voluntary resignation filed, effective 2026-09-24",
      source: "Workday",
    },
    {
      id: "ev-m7",
      ts: "2026-09-14T01:12:00Z",
      kind: "Presence",
      detail: "Endpoint reported locked 01:12 → 01:58",
      source: "Sensor",
    },
    {
      id: "ev-m8",
      ts: "2026-09-14T01:22:47Z",
      kind: "Capture",
      detail:
        "Triggered capture sealed — dual-custody release required to view",
      source: "Sensor",
    },
  ],
};

/* ------------------------------------------------------------- #2071 Dana */

const dana: Dossier = {
  subjectId: "subject_2071",
  verdictLabel: "HIGH",
  logitTotal: 1.27,
  probability: 0.78,
  risk: 78,
  headline:
    "Behaviour alone would not have cleared the bar. The authorising record is the finding: the subject created and assigned it to themselves 40 minutes before the access.",
  contributions: [
    {
      feature: "Base rate (intercept)",
      evidence: INTERCEPT_EVIDENCE,
      logit: -1.9,
    },
    {
      feature: "Manufactured-context indicator",
      evidence:
        "ticket.create(self) → ticket.assign(self) → first-ever access(scope) — indicator fired, prior-seeded weight",
      logit: 0.41,
    },
    {
      feature: "Cohort divergence",
      evidence:
        "D = +2.41 sustained 6 weeks; CUSUM crossed in week 4 — +260% vs cohort",
      logit: 0.26,
    },
    {
      feature: "Resource novelty",
      evidence: "payments-core — no contribution history for this subject",
      logit: 0.15,
    },
    {
      feature: "Volumetric deviation",
      evidence: "38 resources vs cohort median 12 (MAD 4) — robust Z = +4.38",
      logit: 0.08,
    },
    {
      feature: "Composition drift",
      evidence:
        "JSD 0.19 vs anchor — file management share up 22pp, net of cohort",
      logit: 0.07,
    },
    {
      feature: "Geo / ASN novelty",
      evidence: "Corporate ASN, 186 sessions in 180d",
      logit: 0,
    },
    {
      feature: "Presence divergence",
      evidence: "Endpoint reported active for all authenticated actions",
      logit: 0,
    },
    {
      feature: "Employment signal",
      evidence: "Active; no lifecycle event in 180d",
      logit: 0,
    },
    {
      feature: "Context verification",
      evidence:
        "SUSPICIOUS — provenance failed; the suppression channel was exercised abnormally",
      logit: 2.2,
    },
  ],
  checks: [
    {
      test: "precedence",
      result: "pass",
      recordId: "TICKET-9920",
      createdAt: "2026-09-14T14:07:00Z",
      finding:
        "Record precedes the activity by 40m. Exceeds the configured 30m minimum.",
    },
    {
      test: "provenance",
      result: "fail",
      recordId: "TICKET-9920",
      createdBy: "subject_2071",
      finding: "Created by subject_2071 — the subject of this investigation.",
    },
    {
      test: "scope",
      result: "pass",
      recordId: "TICKET-9920",
      finding: "scope_refs names payments-core. Exact match.",
    },
    {
      test: "proportionality",
      result: "warn",
      finding:
        "38 resources against a scope of one repository, with no contribution history in it. Above the 95th percentile for this work class.",
    },
  ],
  comparison: {
    metric: "Distinct resources touched",
    caption:
      "17 cohort members cloned a new repository in the last 90 days. 17 of 17 had a ticket assigned by another identity. 0 of 17 assigned their own.",
    subjectValue: 38,
    stats: BACKEND_PEERS,
    zScore: 4.38,
  },
  attackPath: {
    nodes: [
      {
        id: "create",
        label: "jira.ticket.create",
        sublabel: "TICKET-9920 · created by self",
        sensitivity: "medium",
        x: 0,
        y: 60,
      },
      {
        id: "assign",
        label: "jira.ticket.assign",
        sublabel: "assignee = creator",
        sensitivity: "high",
        x: 190,
        y: 60,
      },
      {
        id: "clone",
        label: "github.repo.clone",
        sublabel: "payments-core · first ever",
        sensitivity: "critical",
        x: 380,
        y: 60,
      },
      {
        id: "archive",
        label: "github.archive.create",
        sublabel: "export.tar.gz · 38 files",
        sensitivity: "critical",
        x: 570,
        y: 60,
      },
      {
        id: "sync",
        label: "dropbox.file.upload",
        sublabel: "Personal cloud account",
        sensitivity: "critical",
        x: 760,
        y: 60,
      },
    ],
    edges: [
      { from: "create", to: "assign", probability: 0.02 },
      { from: "assign", to: "clone", probability: 0.0007, anomalous: true },
      { from: "clone", to: "archive", probability: 0.07 },
      { from: "archive", to: "sync", probability: 0.003, anomalous: true },
    ],
  },
  evidence: [
    {
      id: "ev-d1",
      ts: "2026-09-14T14:05:38Z",
      kind: "Context record",
      detail: "jira.ticket.create — TICKET-9920, scope payments-core",
      source: "Jira",
    },
    {
      id: "ev-d2",
      ts: "2026-09-14T14:07:02Z",
      kind: "Context record",
      detail: "jira.ticket.assign — assignee subject_2071 = creator",
      source: "Jira",
    },
    {
      id: "ev-d3",
      ts: "2026-09-14T14:47:09Z",
      kind: "Action",
      detail: "github.repo.clone — payments-core",
      source: "GitHub Enterprise",
    },
    {
      id: "ev-d4",
      ts: "2026-09-14T15:02:44Z",
      kind: "Action",
      detail: "github.archive.create — export.tar.gz, 38 files",
      source: "GitHub Enterprise",
    },
    {
      id: "ev-d5",
      ts: "2026-09-14T15:19:27Z",
      kind: "Action",
      detail: "dropbox.file.upload — personal cloud account",
      source: "Google Workspace",
    },
    {
      id: "ev-d6",
      ts: "2026-08-03T00:00:00Z",
      kind: "Baseline",
      detail: "Anchor window 60–90d: composition file management 11% → 33%",
      source: "tellTale",
    },
    {
      id: "ev-d7",
      ts: "2026-09-14T14:47:09Z",
      kind: "Suppression record",
      detail: "sup-rev — SCOPE_MATCHED_TICKET, now UNDER REVIEW",
      source: "tellTale",
    },
  ],
};

export const DOSSIERS: Dossier[] = [priya, marcus, dana];

/** The three scenarios, in the order the demo launcher presents them. */
export const SCENARIO_IDS = [
  "subject_8830",
  "subject_4912",
  "subject_2071",
] as const;

export const CONTEXT_GAMMA = {
  authorised: -2.6,
  partial: -1.1,
  absent: 0,
  suspicious: 2.2,
} as const;

export const MODEL_INTERCEPT = -1.9;
