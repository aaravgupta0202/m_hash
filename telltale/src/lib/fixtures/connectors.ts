import type { Connector, ConnectorInstance, ConnectorRibbon } from "./types";

/**
 * Connector health — PRD §5.4. "Now" on the synthetic day is 19:59:12Z, which
 * is what makes the two CloudTrail numbers agree: the ribbon goes red at 19:12
 * and the chip reads "last seen 00:47:12 ago".
 *
 * An attacker who disables a log source produces silence, and silence is a
 * signal. Absence of data is monitored as actively as data (master doc §2.11).
 */

export const NOW = "2026-09-14T19:59:12Z";

export const CONNECTORS: Connector[] = [
  {
    id: "okta",
    name: "Okta",
    state: "healthy",
    lastHeartbeat: "2026-09-14T19:58:46Z",
    lastSeenAgo: "00:00:26 ago",
  },
  {
    id: "gws",
    name: "Google Workspace",
    state: "healthy",
    lastHeartbeat: "2026-09-14T19:58:12Z",
    lastSeenAgo: "00:01:00 ago",
  },
  {
    id: "github",
    name: "GitHub Enterprise",
    state: "healthy",
    lastHeartbeat: "2026-09-14T19:59:01Z",
    lastSeenAgo: "00:00:11 ago",
  },
  {
    id: "cloudtrail",
    name: "AWS CloudTrail",
    state: "degraded",
    lastHeartbeat: "2026-09-14T19:12:00Z",
    lastSeenAgo: "00:47:12 ago",
  },
  {
    id: "jira",
    name: "Jira",
    state: "healthy",
    lastHeartbeat: "2026-09-14T19:57:33Z",
    lastSeenAgo: "00:01:39 ago",
  },
  {
    id: "workday",
    name: "Workday",
    state: "healthy",
    lastHeartbeat: "2026-09-14T19:55:20Z",
    lastSeenAgo: "00:03:52 ago",
  },
];

export const CONNECTOR_INSTANCES: ConnectorInstance[] = [
  {
    source: "Okta",
    type: "online",
    ts: "2026-09-14T00:03:11Z",
    events: 1204,
    expectedBand: "900 – 1,600",
    inBand: true,
  },
  {
    source: "Okta",
    type: "online",
    ts: "2026-09-14T08:01:04Z",
    events: 3871,
    expectedBand: "3,100 – 4,800",
    inBand: true,
  },
  {
    source: "Google Workspace",
    type: "online",
    ts: "2026-09-14T00:02:55Z",
    events: 2210,
    expectedBand: "1,800 – 3,000",
    inBand: true,
  },
  {
    source: "Google Workspace",
    type: "online",
    ts: "2026-09-14T12:00:38Z",
    events: 5436,
    expectedBand: "4,200 – 6,500",
    inBand: true,
  },
  {
    source: "GitHub Enterprise",
    type: "online",
    ts: "2026-09-14T00:01:47Z",
    events: 884,
    expectedBand: "600 – 1,400",
    inBand: true,
  },
  {
    source: "GitHub Enterprise",
    type: "online",
    ts: "2026-09-14T09:00:12Z",
    events: 4102,
    expectedBand: "3,400 – 5,200",
    inBand: true,
  },
  {
    source: "AWS CloudTrail",
    type: "online",
    ts: "2026-09-14T00:04:30Z",
    events: 6650,
    expectedBand: "5,900 – 8,200",
    inBand: true,
  },
  {
    source: "AWS CloudTrail",
    type: "online",
    ts: "2026-09-14T12:04:22Z",
    events: 7488,
    expectedBand: "5,900 – 8,200",
    inBand: true,
  },
  {
    source: "AWS CloudTrail",
    type: "online",
    ts: "2026-09-14T18:04:10Z",
    events: 2140,
    expectedBand: "5,900 – 8,200",
    inBand: false,
  },
  {
    source: "AWS CloudTrail",
    type: "offline",
    ts: "2026-09-14T19:12:00Z",
    events: 0,
    expectedBand: "5,900 – 8,200",
    inBand: false,
  },
  {
    source: "Jira",
    type: "online",
    ts: "2026-09-14T00:05:02Z",
    events: 311,
    expectedBand: "200 – 600",
    inBand: true,
  },
  {
    source: "Workday",
    type: "online",
    ts: "2026-09-14T06:00:00Z",
    events: 48,
    expectedBand: "20 – 90",
    inBand: true,
  },
];

/** Minutes from midnight; the day ends at 1439. */
export const CONNECTOR_RIBBONS: ConnectorRibbon[] = [
  { connectorId: "okta", segments: [{ from: 0, to: 1439, state: "healthy" }] },
  { connectorId: "gws", segments: [{ from: 0, to: 1439, state: "healthy" }] },
  {
    connectorId: "github",
    segments: [{ from: 0, to: 1439, state: "healthy" }],
  },
  {
    connectorId: "cloudtrail",
    segments: [
      { from: 0, to: 1080, state: "healthy" },
      { from: 1080, to: 1152, state: "degraded" },
      { from: 1152, to: 1439, state: "silent" },
    ],
  },
  { connectorId: "jira", segments: [{ from: 0, to: 1439, state: "healthy" }] },
  {
    connectorId: "workday",
    segments: [
      { from: 0, to: 300, state: "healthy" },
      { from: 300, to: 348, state: "degraded" },
      { from: 348, to: 1439, state: "healthy" },
    ],
  },
];

export const CONNECTOR_CALLOUT =
  "An attacker who disables a log source produces silence, and silence is a signal. Every connector carries a dead-man heartbeat with an expected-volume band, so a source that stops reporting — or reports far less than it should — raises an alert of its own. Absence of data is monitored as actively as data.";
