import type { CompositeTimeline } from "./types";
import { QUEUE_TIMELINES } from "./queue-timelines";

/**
 * Composite timeline data — PRD §5.3B, the centrepiece. All times are minutes
 * from midnight on 2026-09-14, so the four lanes share one axis by construction
 * rather than by coincidence.
 *
 * The story is in the shape, and it has to read without narration:
 *
 *   #4912 Marcus — CONTEXT is empty across 01:00–02:00, exactly where
 *                  TRAJECTORY is busiest and RISK climbs 8 → 93.
 *                  It is NOT empty all day: a sprint record covers 09:00–17:30,
 *                  so the gap reads as an absence of authorisation rather than
 *                  an absence of data.
 *   #8830 Priya  — CONTEXT spans the entire day; RISK stays flat.
 *   #2071 Dana   — CONTEXT exists but begins 14:07, forty minutes before the
 *                  access, and is marked suspicious rather than authorising.
 */

const priya: CompositeTimeline = {
  subjectId: "subject_8830",
  session: [
    { t: 546, ts: "2026-09-14T09:06:12Z", action: "okta.session.start", sensitivity: "low", note: "Corporate ASN 24560 · Bengaluru" },
    { t: 785, ts: "2026-09-14T13:05:40Z", action: "okta.token.refresh", sensitivity: "low" },
  ],
  trajectory: [
    { t: 570, ts: "2026-09-14T09:30:18Z", action: "jira.issue.comment", resource: "TICKET-4471", sensitivity: "low" },
    { t: 615, ts: "2026-09-14T10:15:41Z", action: "github.repo.clone", resource: "payments-core", sensitivity: "critical", firstEver: true, note: "First access in 180d" },
    { t: 622, ts: "2026-09-14T10:22:05Z", action: "github.branch.create", resource: "fix/ledger-rounding", sensitivity: "medium" },
    { t: 664, ts: "2026-09-14T11:04:55Z", action: "github.pr.open", resource: "payments-core#2244", sensitivity: "low" },
    { t: 820, ts: "2026-09-14T13:40:12Z", action: "github.pr.review", resource: "billing-web#1907", sensitivity: "low" },
    { t: 912, ts: "2026-09-14T15:12:33Z", action: "jira.issue.transition", resource: "TICKET-4471", sensitivity: "low" },
  ],
  context: [
    { from: 0, to: 1439, recordId: "TICKET-4471", label: "Scope-matched ticket · assigned by subject_5530", verdict: "authorised" },
  ],
  risk: [
    { t: 0, risk: 11 },
    { t: 600, risk: 11 },
    { t: 615, risk: 14 },
    { t: 1439, risk: 14 },
  ],
};

const marcus: CompositeTimeline = {
  subjectId: "subject_4912",
  session: [
    { t: 74, ts: "2026-09-14T01:14:03Z", action: "okta.session.start", sensitivity: "medium", asnChange: true, firstEver: true, note: "ASN 51167 · commercial VPN · Zurich · first in 180d" },
    { t: 78, ts: "2026-09-14T01:18:20Z", action: "okta.mfa.challenge", sensitivity: "medium", note: "Push approved · device fingerprint unrecognised" },
    { t: 542, ts: "2026-09-14T09:02:51Z", action: "okta.session.start", sensitivity: "low", note: "Corporate ASN 24560 · Bengaluru" },
  ],
  trajectory: [
    { t: 82, ts: "2026-09-14T01:22:47Z", action: "github.repo.clone", resource: "payments-core", sensitivity: "critical", firstEver: true, note: "First ever" },
    { t: 95, ts: "2026-09-14T01:35:11Z", action: "github.archive.create", resource: "bundle.tar.gz", sensitivity: "critical", note: "410 files" },
    { t: 102, ts: "2026-09-14T01:42:02Z", action: "aws.s3.put_object", resource: "s3://ext-7731-backup", sensitivity: "critical", firstEver: true, note: "Outside org account boundary" },
    { t: 554, ts: "2026-09-14T09:14:30Z", action: "github.pr.review", resource: "ledger-api#884", sensitivity: "low" },
    { t: 630, ts: "2026-09-14T10:30:02Z", action: "jira.issue.comment", resource: "SPRINT-2291", sensitivity: "low" },
    { t: 705, ts: "2026-09-14T11:45:19Z", action: "github.repo.clone", resource: "ledger-api", sensitivity: "medium" },
    { t: 860, ts: "2026-09-14T14:20:44Z", action: "github.pr.open", resource: "ledger-api#889", sensitivity: "low" },
    { t: 965, ts: "2026-09-14T16:05:08Z", action: "slack.channel.join", resource: "#platform-oncall", sensitivity: "low" },
  ],
  context: [
    { from: 540, to: 1050, recordId: "SPRINT-2291", label: "Sprint assignment · ledger-api · assigned by subject_6302", verdict: "authorised" },
  ],
  risk: [
    { t: 0, risk: 8 },
    { t: 74, risk: 8 },
    { t: 78, risk: 31 },
    { t: 82, risk: 54 },
    { t: 95, risk: 76 },
    { t: 102, risk: 93 },
    { t: 1439, risk: 93 },
  ],
};

const dana: CompositeTimeline = {
  subjectId: "subject_2071",
  session: [
    { t: 538, ts: "2026-09-14T08:58:44Z", action: "okta.session.start", sensitivity: "low", note: "Corporate ASN 24560 · Pune" },
    { t: 840, ts: "2026-09-14T14:00:11Z", action: "okta.token.refresh", sensitivity: "low" },
  ],
  trajectory: [
    { t: 570, ts: "2026-09-14T09:30:27Z", action: "jira.issue.comment", resource: "LEDGER-771", sensitivity: "low" },
    { t: 675, ts: "2026-09-14T11:15:03Z", action: "github.pr.review", resource: "ledger-api#886", sensitivity: "low" },
    { t: 845, ts: "2026-09-14T14:05:38Z", action: "jira.ticket.create", resource: "TICKET-9920", sensitivity: "medium", note: "Created by the subject" },
    { t: 847, ts: "2026-09-14T14:07:02Z", action: "jira.ticket.assign", resource: "TICKET-9920", sensitivity: "high", note: "Assignee = creator" },
    { t: 887, ts: "2026-09-14T14:47:09Z", action: "github.repo.clone", resource: "payments-core", sensitivity: "critical", firstEver: true, note: "First ever · 40m after the record" },
    { t: 902, ts: "2026-09-14T15:02:44Z", action: "github.archive.create", resource: "export.tar.gz", sensitivity: "critical", note: "38 files" },
    { t: 919, ts: "2026-09-14T15:19:27Z", action: "dropbox.file.upload", resource: "personal-account", sensitivity: "critical", firstEver: true, note: "Personal cloud account" },
  ],
  context: [
    { from: 847, to: 1439, recordId: "TICKET-9920", label: "Self-created, self-assigned · provenance failed", verdict: "suspicious" },
  ],
  risk: [
    { t: 0, risk: 20 },
    { t: 840, risk: 20 },
    { t: 845, risk: 22 },
    { t: 847, risk: 34 },
    { t: 887, risk: 52 },
    { t: 902, risk: 68 },
    { t: 919, risk: 78 },
    { t: 1439, risk: 78 },
  ],
};

/** The three authored scenarios. Assertions in verify-fixtures.mjs target these. */
export const TIMELINES: CompositeTimeline[] = [priya, marcus, dana];

/** Authored scenarios first, then the generated queue rows. */
export const ALL_TIMELINES: CompositeTimeline[] = [...TIMELINES, ...QUEUE_TIMELINES];

export function timelineFor(subjectId: string): CompositeTimeline | undefined {
  return ALL_TIMELINES.find((t) => t.subjectId === subjectId);
}
