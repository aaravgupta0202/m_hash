/**
 * Fixture types. Every field here is a literal in a fixture file — nothing in
 * this app computes a score at runtime (PRD §1). The detection engine these
 * shapes describe lives in the master document, not in this repository.
 */

export type IdentityClass = "human" | "service" | "agent";
export type ContextVerdict = "authorised" | "partial" | "absent" | "suspicious";
export type Sensitivity = "low" | "medium" | "high" | "critical";
export type SubjectStatus = "new" | "triaging" | "suppressed" | "confirmed";
export type CheckResult = "pass" | "fail" | "warn";
export type Lane = "session" | "trajectory" | "context";

export interface Subject {
  /** 'subject_4912' */
  id: string;
  /** '#4912' — the only form ever rendered in the risk module */
  pseudonym: string;
  cohort: string;
  cohortSize: number;
  identityClass: IdentityClass;
  tenureDays: number;
  /** Cloud-only subjects omit presence divergence and composition drift (PRD §6). */
  sensorEquipped: boolean;
  /** 0..100, calibrated probability × 100 */
  risk: number;
  /** 0..1 weight of the most critical asset in the trajectory */
  assetCriticality: number;
  /** risk × assetCriticality — the queue sort key */
  expectedCost: number;
  verdict: ContextVerdict;
  topSignal: string;
  status: SubjectStatus;
  /** Distinct resources touched in the evaluation window — the volumetric feature. */
  resourcesTouched: number;
}

/** Robust cohort statistics: median and MAD, per master doc §2.3. */
export interface CohortStats {
  cohort: string;
  /** Members excluding the subject under investigation. */
  n: number;
  median: number;
  mad: number;
  /** Peer values, for the beeswarm in PRD §5.3F. */
  values: number[];
}

export interface Contribution {
  feature: string;
  evidence: string;
  /** Signed. Contributions sum to the dossier's logitTotal. */
  logit: number;
}

export interface ContextCheck {
  test: "precedence" | "provenance" | "scope" | "proportionality";
  result: CheckResult;
  recordId?: string;
  createdBy?: string;
  createdAt?: string;
  finding: string;
}

export interface TimelineTick {
  /** Minutes from midnight on the synthetic day. */
  t: number;
  /** ISO timestamp, rendered in mono. */
  ts: string;
  /** Canonical action token, e.g. 'github.repo.clone'. */
  action: string;
  resource?: string;
  sensitivity: Sensitivity;
  note?: string;
  firstEver?: boolean;
  /** SESSION lane only: this tick is an ASN change. */
  asnChange?: boolean;
}

export interface ContextBar {
  /** Minutes from midnight. */
  from: number;
  to: number;
  recordId: string;
  label: string;
  /** A bar whose own provenance failed renders as suspicious, not authorising. */
  verdict: ContextVerdict;
}

export interface RiskPoint {
  t: number;
  risk: number;
}

export interface CompositeTimeline {
  subjectId: string;
  session: TimelineTick[];
  trajectory: TimelineTick[];
  context: ContextBar[];
  risk: RiskPoint[];
}

export interface AttackPathNode {
  id: string;
  label: string;
  sublabel: string;
  sensitivity: Sensitivity;
  /** Hand-positioned; no auto-layout (PRD §5.3E). */
  x: number;
  y: number;
}

export interface AttackPathEdge {
  from: string;
  to: string;
  /** Empirical transition probability, rendered as the edge label. */
  probability?: number;
  anomalous?: boolean;
}

export interface EvidenceItem {
  id: string;
  ts: string;
  kind: string;
  detail: string;
  source: string;
}

export interface CohortComparison {
  metric: string;
  /** Prose statement of the denominator (PRD §5.3F). */
  caption: string;
  subjectValue: number;
  stats: CohortStats;
  /** Robust Z, recomputed by the verifier from median and MAD. */
  zScore: number;
}

export interface Dossier {
  subjectId: string;
  verdictLabel: string;
  /** Sum of contribution logits. */
  logitTotal: number;
  /** σ(logitTotal), to 2dp. */
  probability: number;
  /** round(probability × 100) — the displayed risk. */
  risk: number;
  headline: string;
  contributions: Contribution[];
  checks: ContextCheck[];
  comparison: CohortComparison;
  attackPath: { nodes: AttackPathNode[]; edges: AttackPathEdge[] };
  evidence: EvidenceItem[];
  /** Present only on cloud-only subjects. */
  sensorNote?: string;
}

/* ---------- Connector health ---------- */

export type ConnectorState = "healthy" | "degraded" | "silent";

export interface Connector {
  id: string;
  name: string;
  state: ConnectorState;
  lastHeartbeat: string;
  /** e.g. '00:47:12 ago' */
  lastSeenAgo: string;
}

export interface ConnectorInstance {
  source: string;
  type: "online" | "offline";
  ts: string;
  events: number;
  expectedBand: string;
  inBand: boolean;
}

export interface RibbonSegment {
  from: number;
  to: number;
  state: ConnectorState;
}

export interface ConnectorRibbon {
  connectorId: string;
  segments: RibbonSegment[];
}

/* ---------- Suppression log ---------- */

export interface Suppression {
  id: string;
  ts: string;
  subjectPseudonym: string;
  anomaly: string;
  suppressedBy: string;
  reasonCode: string;
  reviewable: boolean;
  underReview?: boolean;
  /** The exact context record that caused suppression. */
  record: {
    recordId: string;
    createdBy: string;
    createdAt: string;
    scope: string;
  };
  /** Set on the UNDER REVIEW row — closes the loop to Dana. */
  linkedSubjectId?: string;
}

/* ---------- Dashboard ---------- */

export interface StatTile {
  label: string;
  value: string;
  sub: string;
}

export interface NoiseSegment {
  label: string;
  reasonCode: string;
  pct: number;
  count: number;
  escalated?: boolean;
}

export interface TrendPoint {
  date: string;
  risk: number;
  /** The score before context verification, where it differs from `risk`. */
  raisedRisk?: number;
  /** Labelled spike linking to a subject. */
  spikeSubjectId?: string;
  spikeLabel?: string;
}

/* ---------- Workforce module (named employees, no risk scores) ---------- */

export interface WorkforceMember {
  id: string;
  name: string;
  team: string;
  workingMinutes: number;
  idleMinutes: number;
  topApplication: string;
  lastSeen: string;
  sensorEquipped: boolean;
  /** 24 hourly states for the activity ribbon. */
  ribbon: ("active" | "idle" | "offline")[];
}

export interface CategoryTime {
  category: string;
  minutes: number;
}

export interface ApplicationUse {
  application: string;
  windowTitle: string;
  category: string;
  minutes: number;
}

export interface HourSlot {
  hour: string;
  workingMinutes: number;
  idleMinutes: number;
}

export interface Capture {
  id: string;
  memberId: string;
  memberName: string;
  ts: string;
  mode: "scheduled" | "triggered";
  application: string;
  /** Deterministic seed for the generated placeholder panel. */
  seed: number;
  flagged?: boolean;
}
