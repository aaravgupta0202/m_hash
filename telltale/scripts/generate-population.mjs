/**
 * Seeded population generator (PRD §6). Run once; the OUTPUT IS COMMITTED as a
 * static array. Nothing randomises at runtime, so the numbers in the video and
 * the numbers a judge sees are the same numbers.
 *
 *   node scripts/generate-population.mjs
 *
 * Emits:
 *   src/lib/fixtures/population.ts      100 subjects + per-cohort robust stats
 *   src/lib/fixtures/queue-dossiers.ts  reduced dossiers for the 11 non-scenario
 *                                       queue subjects, so a judge clicking any
 *                                       queue row lands on a real page
 */
import { promises as fs } from "node:fs";
import path from "node:path";

/* ------------------------------------------------------------------ helpers */

const sigma = (x) => 1 / (1 + Math.exp(-x));
const logit = (p) => Math.log(p / (1 - p));
const r2 = (x) => Math.round(x * 100) / 100;
/** Sum at 2dp the way a reader adds a printed column, not with float drift. */
const sumCents = (xs) => xs.reduce((a, x) => a + Math.round(x * 100), 0) / 100;

function median(xs) {
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}
/** Median absolute deviation — master doc §2.3. */
function mad(xs) {
  const med = median(xs);
  return median(xs.map((x) => Math.abs(x - med)));
}
/** Robust Z: |x − median| / (1.4826 · MAD), signed. */
function robustZ(x, med, m) {
  return (x - med) / (1.4826 * m);
}

/** Deterministic LCG. Same seed, same population, forever. */
function lcg(seed) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}
const rand = lcg(20260914);
const pick = (xs) => xs[Math.floor(rand() * xs.length)];
const int = (lo, hi) => lo + Math.floor(rand() * (hi - lo + 1));

/* ------------------------------------------------------ authored anchors */

/**
 * Backend Engineering peer values for `resourcesTouched`, hand-built so the
 * cohort's robust statistics are exactly median 12 / MAD 4. Those two numbers
 * appear in prose on three investigation pages, so they are load-bearing —
 * verify-fixtures.mjs recomputes them from this array and fails if they drift.
 */
const BE_PEERS = [
  4, 5, 6, 6, 7, 7, 8, 8, 8, 9, 9, 10, 10, 11, 11, 11,
  12,
  13, 13, 14, 14, 15, 16, 16, 17, 18, 19, 20, 22, 24, 27, 31, 38,
];

/**
 * The 14 queue rows, authored. Sorted by expectedCost, NOT by risk (PRD §5.2).
 *
 * `dominant` names the detector that matches the row's top signal and carries
 * most of its weight; `ev` supplies the observed values that every other
 * contribution is derived from, so each row's number is reproducible from the
 * evidence printed beside it.
 */
const QUEUE = [
  { p: "4912", cohort: "Backend Engineering",  cls: "human",   risk: 93, crit: 1.00, verdict: "absent",     sensor: true,  res: 410, status: "new",      top: "Trajectory surprisal P = 0.0004",        dominant: null,          ev: {} },
  { p: "7741", cohort: "Automation Platform",  cls: "service", risk: 96, crit: 0.88, verdict: "absent",     sensor: false, res: 64,  status: "new",      top: "Honeytoken credential used",             dominant: "deception",   ev: { firstSeen: 12, asn: 3, privilege: 2 } },
  { p: "2071", cohort: "Backend Engineering",  cls: "human",   risk: 78, crit: 0.97, verdict: "suspicious", sensor: true,  res: 38,  status: "triaging", top: "Manufactured context detected",          dominant: null,          ev: {} },
  { p: "5530", cohort: "Platform SRE",         cls: "human",   risk: 74, crit: 0.95, verdict: "absent",     sensor: true,  res: 34,  status: "new",      top: null,                                     dominant: "presence",    ev: { presenceActions: 8, firstSeen: 7, asn: 1, jsd: 0.10 } },
  { p: "1188", cohort: "Data Platform",        cls: "agent",   risk: 71, crit: 0.93, verdict: "partial",    sensor: false, res: 147, status: "new",      top: null,                                     dominant: "egress",      ev: { egress: 3, firstSeen: 9 } },
  { p: "6302", cohort: "Platform SRE",         cls: "human",   risk: 69, crit: 0.90, verdict: "absent",     sensor: true,  res: 29,  status: "triaging", top: null,                                     dominant: "egress",      ev: { egress: 2, firstSeen: 6, asn: 2, jsd: 0.14 } },
  { p: "3914", cohort: "Customer Support",     cls: "human",   risk: 66, crit: 0.86, verdict: "partial",    sensor: true,  res: 22,  status: "new",      top: null,                                     dominant: "divergence",  ev: { drift: 3.2, firstSeen: 4, jsd: 0.11, presenceActions: 4, privilege: 1 } },
  { p: "8125", cohort: "Finance Operations",   cls: "human",   risk: 61, crit: 0.84, verdict: "partial",    sensor: true,  res: 44,  status: "new",      top: null,                                     dominant: "offHours",    ev: { offHours: 3, firstSeen: 5, asn: 1, jsd: 0.14, presenceActions: 3 } },
  { p: "4407", cohort: "Customer Support",     cls: "human",   risk: 58, crit: 0.82, verdict: "absent",     sensor: false, res: 14,  status: "new",      top: null,                                     dominant: "graph",       ev: { edges: 5, firstSeen: 4, asn: 2 } },
  { p: "9663", cohort: "Automation Platform",  cls: "service", risk: 55, crit: 0.80, verdict: "partial",    sensor: false, res: 33,  status: "new",      top: null,                                     dominant: "privilege",   ev: { privilege: 3, firstSeen: 6, asn: 2, edges: 2, egress: 1 } },
  { p: "2258", cohort: "Finance Operations",   cls: "human",   risk: 49, crit: 0.77, verdict: "partial",    sensor: true,  res: 12,  status: "new",      top: null,                                     dominant: "privilege",   ev: { privilege: 2, firstSeen: 3, asn: 1, jsd: 0.18, presenceActions: 3, devices: 1 } },
  { p: "7015", cohort: "Data Platform",        cls: "human",   risk: 44, crit: 0.74, verdict: "absent",     sensor: true,  res: 26,  status: "new",      top: null,                                     dominant: "composition", ev: { jsd: 0.28, firstSeen: 2, asn: 1, presenceActions: 2 } },
  { p: "5871", cohort: "Finance Operations",   cls: "human",   risk: 38, crit: 0.71, verdict: "partial",    sensor: true,            status: "new",      top: null,                                     dominant: "volumetric",  ev: { firstSeen: 3, asn: 1, jsd: 0.12, presenceActions: 3 } },
  /* Authorised work that is still worth an analyst's time: the ticket covers
     the repository, but not 96 resources against a support scope. The context
     tests pass and proportionality warns, which is the one combination that
     puts an AUTHORISED row in the queue at all. */
  { p: "3340", cohort: "Customer Support",     cls: "human",   risk: 31, crit: 0.68, verdict: "authorised", sensor: false, res: 96,  status: "new",      top: null,                                     dominant: "volumetric",  template: "bulk", ev: { devices: 2, firstSeen: 8, asn: 2, edges: 1 } },
];

/** Priya: in the population and the suppression log, never in the queue. */
const PRIYA = {
  p: "8830", cohort: "Backend Engineering", cls: "human", risk: 14, crit: 1.00,
  verdict: "authorised", sensor: true, res: 9, status: "suppressed",
  top: "First-ever repository access — authorised",
};

/**
 * Six cohorts, smallest 11. Robust statistics over a cohort of two or three are
 * meaningless, and this build DISPLAYS each cohort's median and MAD on the
 * investigation page — so no cohort is allowed to be too small to support the
 * number printed next to it.
 */
const COHORT_PLAN = [
  { name: "Backend Engineering", total: 36, resRange: [4, 34] },
  { name: "Platform SRE",        total: 15, resRange: [6, 40] },
  { name: "Finance Operations",  total: 14, resRange: [4, 30] },
  { name: "Data Platform",       total: 12, resRange: [8, 60] },
  { name: "Customer Support",    total: 12, resRange: [3, 24] },
  // Service and agent identities touch far more resources than people do.
  { name: "Automation Platform", total: 11, resRange: [24, 96] },
];

const FILLER_SIGNALS = [
  "Volumetric within baseline",
  "Session pattern stable",
  "Cohort-tracking, no drift",
  "Single off-hours session",
  "Permission read, in scope",
  "New device, enrolled",
  "Scope-matched ticket present",
  "On-call rotation active",
];

/* --------------------------------------------------------------- build */

const subjects = [];
const used = new Set();

function addSubject(s) {
  if (used.has(s.pseudonym)) throw new Error(`duplicate pseudonym ${s.pseudonym}`);
  used.add(s.pseudonym);
  subjects.push(s);
}

/** A 4-digit pseudonym not already taken. `used` stores the '#'-prefixed form. */
function freePseudonym() {
  let p;
  do {
    p = String(int(1000, 9999));
  } while (used.has(`#${p}`));
  return p;
}

function makeSubject({ p, cohort, cls, risk, crit, verdict, sensor, res = 0, status, top = "" }) {
  return {
    id: `subject_${p}`,
    pseudonym: `#${p}`,
    cohort,
    cohortSize: COHORT_PLAN.find((c) => c.name === cohort).total,
    identityClass: cls,
    tenureDays: int(45, 2400),
    sensorEquipped: sensor,
    risk,
    assetCriticality: crit,
    expectedCost: r2(risk * crit),
    verdict,
    topSignal: top,
    status,
    resourcesTouched: res,
  };
}

// Pinned: the 14 queue rows, then Priya.
for (const q of QUEUE) addSubject(makeSubject(q));
addSubject(makeSubject(PRIYA));

// Backend Engineering peers carry the hand-built values so the cohort's
// median/MAD are exact.
const bePeerCount = BE_PEERS.length; // 33
for (let i = 0; i < bePeerCount; i++) {
  addSubject(
    makeSubject({
      p: freePseudonym(),
      cohort: "Backend Engineering",
      cls: "human",
      risk: int(2, 22),
      crit: r2(0.4 + rand() * 0.5),
      verdict: pick(["authorised", "authorised", "partial", "absent"]),
      sensor: true,
      res: BE_PEERS[i],
      status: pick(["new", "suppressed", "suppressed"]),
      top: pick(FILLER_SIGNALS),
    }),
  );
}

// Remaining cohorts, filled to plan.
for (const { name, total, resRange } of COHORT_PLAN) {
  const have = subjects.filter((s) => s.cohort === name).length;
  for (let i = have; i < total; i++) {
    const cls =
      name === "Automation Platform"
        ? pick(["service", "service", "agent"])
        : pick(["human", "human", "human", "human", "service"]);
    addSubject(
      makeSubject({
        p: freePseudonym(),
        cohort: name,
        cls,
        risk: int(2, 24),
        crit: r2(0.35 + rand() * 0.55),
        verdict: pick(["authorised", "authorised", "partial", "absent"]),
        sensor: true, // corrected below to hit exactly 72
        res: int(resRange[0], resRange[1]),
        status: pick(["new", "suppressed", "suppressed"]),
        top: pick(FILLER_SIGNALS),
      }),
    );
  }
}

if (subjects.length !== 100) throw new Error(`expected 100 subjects, built ${subjects.length}`);

/* Sensor coverage: exactly 72 of 100 (PRD §6). The 15 pinned subjects keep the
   flag they were authored with; the rest are switched off in a deterministic
   order until the total lands on 72. */
const pinned = new Set([...QUEUE.map((q) => `#${q.p}`), `#${PRIYA.p}`]);
let sensorCount = subjects.filter((s) => s.sensorEquipped).length;
for (const s of subjects) {
  if (sensorCount <= 72) break;
  if (pinned.has(s.pseudonym)) continue;
  if (!s.sensorEquipped) continue;
  s.sensorEquipped = false;
  sensorCount--;
}
if (sensorCount !== 72) throw new Error(`sensor coverage is ${sensorCount}, expected 72`);

/* ------------------------------------------------- per-cohort statistics */

/** Stats over cohort members EXCLUDING the named subject (the peer group). */
function statsFor(cohort, excludePseudonym) {
  const values = subjects
    .filter((s) => s.cohort === cohort && s.pseudonym !== excludePseudonym)
    .map((s) => s.resourcesTouched)
    .sort((a, b) => a - b);
  return { cohort, n: values.length, median: median(values), mad: mad(values), values };
}

/**
 * #5871's queue row names its own Z-score as the top signal, so the value has
 * to be back-solved from its peer group rather than guessed: pick the resource
 * count that lands on Z ≈ +3.10, then read the true Z off the result. The
 * displayed number is the computed one, not the intended one.
 */
{
  const target = QUEUE.find((q) => q.p === "5871");
  const s5871 = subjects.find((s) => s.pseudonym === "#5871");
  const peers = statsFor(target.cohort, "#5871");
  s5871.resourcesTouched = Math.round(peers.median + 3.1 * 1.4826 * peers.mad);
  target.res = s5871.resourcesTouched;
  // topSignal is set by buildReducedDossier, which names the largest term.
}

const BE_STATS = statsFor("Backend Engineering", null);
// Peers of a Backend Engineering subject = the 33 hand-built values. The three
// scenario subjects are excluded from each other's peer group by construction.
const BE_PEER_STATS = {
  cohort: "Backend Engineering",
  n: BE_PEERS.length,
  median: median(BE_PEERS),
  mad: mad(BE_PEERS),
  values: [...BE_PEERS].sort((a, b) => a - b),
};

if (BE_PEER_STATS.median !== 12 || BE_PEER_STATS.mad !== 4) {
  throw new Error(`Backend Engineering peers must be median 12 / MAD 4, got ${BE_PEER_STATS.median} / ${BE_PEER_STATS.mad}`);
}

const COHORT_STATS = COHORT_PLAN.map(({ name }) => statsFor(name, null));

/* ------------------------------- reduced dossiers for the other 11 rows */

const GAMMA = { authorised: -2.6, partial: -1.1, absent: 0, suspicious: 2.2 };

/**
 * β₀ = −1.90 → σ(−1.90) = 13.0%.
 *
 * This is a prior over SCORED IDENTITIES, not over all identity-days, and it is
 * read straight off the dashboard: 3 confirmed findings out of 23 investigations
 * in the last 30 days is 13.0%. An intercept much more negative than this forces
 * every benign-but-authorised subject to carry an implausible amount of anomaly
 * mass just to reach its own displayed score, which is how a contribution table
 * ends up contradicting itself.
 */
const INTERCEPT = -1.9;

/**
 * Each detector's contribution is a stated monotone function of the evidence
 * printed beside it, so a reader can reproduce the number from the row. Every
 * coefficient is non-negative: more anomaly must never reduce risk (master doc
 * §2.7 monotonicity constraint).
 *
 * verify-fixtures.mjs re-derives each of these from the evidence string.
 */
const F = {
  // Robust Z at or below +0.5 is within baseline and contributes nothing.
  volumetric: (z) => (z <= 0.5 ? 0 : Math.min(1.3, r2(0.34 * (z - 0.5)))),
  resourceNovelty: (n) => Math.min(1.1, r2(0.09 * n)),
  asn: (n) => (n === 0 ? 0 : Math.min(0.8, r2(0.21 * n))),
  divergence: (d) => Math.min(1.2, r2(0.36 * d)),
  presence: (n) => Math.min(0.95, r2(0.11 * n)),
  composition: (j) => Math.min(0.8, r2(2.4 * j)),
  graph: (n) => Math.min(1.0, r2(0.19 * n)),
  offHours: (n) => Math.min(0.9, r2(0.3 * n)),
  privilege: (n) => Math.min(1.1, r2(0.45 * n)),
  device: (n) => Math.min(0.7, r2(0.3 * n)),
  egress: (n) => Math.min(1.4, r2(0.62 * n)),
  // Prior-seeded, not fitted: honeytokens produce too few positives to fit
  // reliably (master doc §2.7). Flagged as a prior in the evidence string.
  deception: () => 2.2,
};

/** Label used in the queue's Top signal column, derived from the largest term. */
const SIGNAL_LABEL = {
  "Trajectory surprisal": (d) => `Session perplexity ${d.perplexity}`,
  "Deception trigger": () => "Honeytoken credential used",
  "Presence divergence": (d) => `Presence divergence, ${d.presenceActions} actions while locked`,
  "Novel egress path": (d) => `Novel egress path, ${d.egress} unaffiliated destination${d.egress === 1 ? "" : "s"}`,
  "Cohort divergence": (d) => `Cohort divergence, D = +${d.drift.toFixed(2)}`,
  "Off-hours activity": (d) => `Off-hours activity, ${d.offHours} session${d.offHours === 1 ? "" : "s"}`,
  "Graph topology change": (d) => `Graph topology, ${d.edges} new external edges`,
  "Privilege change": (d) => `Privilege change, ${d.privilege} outside change window`,
  "Composition drift": (d) => `Composition drift, JSD ${d.jsd.toFixed(2)}`,
  "Device novelty": (d) => `Device novelty, ${d.devices} newly enrolled`,
  "Volumetric deviation": (d) => `Volumetric deviation, Z = ${d.z >= 0 ? "+" : ""}${d.z.toFixed(2)}`,
  "Resource novelty": (d) => `Resource novelty, ${d.firstSeen} first-seen resources`,
};

function buildReducedDossier(q) {
  const subject = subjects.find((s) => s.pseudonym === `#${q.p}`);
  const stats = statsFor(q.cohort, subject.pseudonym);
  const z = r2(robustZ(q.res, stats.median, stats.mad));
  const target = r2(logit(q.risk / 100));
  const gamma = GAMMA[q.verdict];
  const ev = q.ev;

  const rows = [];
  const push = (feature, evidence, logit) => rows.push({ feature, evidence, logit });

  // Volumetric always appears: its absence would hide the comparison the
  // cohort panel on the same page is making.
  push(
    "Volumetric deviation",
    `${q.res} resources vs cohort median ${stats.median} (MAD ${stats.mad}) — robust Z = ${z >= 0 ? "+" : ""}${z.toFixed(2)}${
      z <= 0.5 ? " — within baseline" : ""
    }`,
    F.volumetric(z),
  );

  if (ev.firstSeen) {
    push(
      "Resource novelty",
      `${ev.firstSeen} of ${q.res} resources first seen in 180d`,
      F.resourceNovelty(ev.firstSeen),
    );
  }
  if (ev.asn) {
    push(
      "Geo / ASN novelty",
      `${ev.asn} session${ev.asn === 1 ? "" : "s"} from an ASN unseen in 180d`,
      F.asn(ev.asn),
    );
  }
  if (ev.egress) {
    push(
      "Novel egress path",
      `${ev.egress} destination${ev.egress === 1 ? "" : "s"} outside org accounts, no prior instance`,
      F.egress(ev.egress),
    );
  }
  if (ev.drift) {
    push(
      "Cohort divergence",
      `D = +${ev.drift.toFixed(2)} against the 60–90d anchor, net of cohort movement`,
      F.divergence(ev.drift),
    );
  }
  if (ev.edges) {
    push("Graph topology change", `${ev.edges} new external-domain edges this window`, F.graph(ev.edges));
  }
  if (ev.offHours) {
    push(
      "Off-hours activity",
      `${ev.offHours} session${ev.offHours === 1 ? "" : "s"} outside the subject's own working-hours envelope`,
      F.offHours(ev.offHours),
    );
  }
  if (ev.privilege) {
    push(
      "Privilege change",
      `${ev.privilege} permission or policy edit${ev.privilege === 1 ? "" : "s"} outside the change window`,
      F.privilege(ev.privilege),
    );
  }
  if (ev.devices) {
    push("Device novelty", `${ev.devices} device fingerprints first seen in 180d`, F.device(ev.devices));
  }
  if (q.dominant === "deception") {
    push(
      "Deception trigger",
      "Decoy credential ci-deploy-svc-legacy presented against ledger-api — prior-seeded weight, exempt from suppression",
      F.deception(),
    );
  }
  // Sensor-only detectors. Cloud-only identities must visibly omit both.
  if (q.sensor && ev.presenceActions) {
    push(
      "Presence divergence",
      `${ev.presenceActions} authenticated actions while the endpoint reported locked or idle`,
      F.presence(ev.presenceActions),
    );
  }
  if (q.sensor && ev.jsd) {
    push(
      "Composition drift",
      `JSD ${ev.jsd.toFixed(2)} vs anchor, net of cohort movement`,
      F.composition(ev.jsd),
    );
  }

  // Trajectory surprisal absorbs the remainder. Perplexity is DERIVED from the
  // contribution rather than picked, so the printed "one in N" and the printed
  // logit are the same statement twice.
  const needed = r2(target - INTERCEPT - gamma);
  const assigned = sumCents(rows.map((r) => r.logit));
  const residual = r2(needed - assigned);
  if (residual < 0) {
    throw new Error(
      `#${q.p}: derived features (${assigned}) already exceed the required mass (${needed}). Lower the evidence values.`,
    );
  }
  /*
   * Two guards on the residual, both learned from getting it wrong.
   *
   * A residual above 1.10 prints a session perplexity above 12 — "one in 12
   * sessions of this shape" — which is a strong claim to make about a subject
   * whose page says nothing else is unusual. And if the residual is the largest
   * term, the queue's Top signal column ends up naming trajectory surprisal on
   * nine of fourteen rows while each row's own evidence points elsewhere.
   *
   * The fix is not to clamp the number. It is to fail the build so the row's
   * evidence gets tuned until the detector that the story is about carries the
   * weight. Clamping would leave the arithmetic broken and hide it.
   */
  const largestDerived = rows.reduce((a, r) => Math.max(a, r.logit), 0);
  if (residual > 1.1) {
    throw new Error(
      `#${q.p}: residual ${residual} implies session perplexity ${r2(4 * Math.exp(residual))}, above the ` +
        `plausible ceiling of 12. Add evidence to this row so its own detectors carry the mass.`,
    );
  }
  if (q.dominant && residual > largestDerived) {
    throw new Error(
      `#${q.p}: trajectory surprisal (${residual}) would be the largest term, but this row's story is ` +
        `"${q.dominant}" (${largestDerived}). The Top signal column would contradict the evidence.`,
    );
  }
  const perplexity = r2(4 * Math.exp(residual));
  push(
    "Trajectory surprisal",
    `Session perplexity ${perplexity.toFixed(2)} against the order-2 backoff model`,
    residual,
  );

  const contributions = [
    {
      feature: "Base rate (intercept)",
      evidence: "Prior over scored identities — 3 of 23 investigations confirmed in 30d",
      logit: INTERCEPT,
    },
    ...rows,
    {
      feature: "Context verification",
      evidence: {
        authorised: "AUTHORISED — precedence, provenance, scope and proportionality all pass",
        partial: "PARTIAL — scope match failed; the anomaly is real but partly explained",
        absent: "ABSENT — no authorising record found in any context source",
        suspicious: "SUSPICIOUS — provenance failed; record created by the subject",
      }[q.verdict],
      logit: gamma,
    },
  ];

  const logitTotal = sumCents(contributions.map((c) => c.logit));
  const probability = r2(sigma(logitTotal));
  const risk = Math.round(sigma(logitTotal) * 100);
  if (risk !== q.risk) throw new Error(`#${q.p}: reduced dossier lands on ${risk}, authored ${q.risk}`);

  // The queue's Top signal column names the largest anomaly term in the table.
  const anomalyRows = rows.filter((r) => r.logit > 0);
  const largest = anomalyRows.reduce((a, b) => (b.logit > a.logit ? b : a), anomalyRows[0]);
  const labelData = { ...ev, z, perplexity: perplexity.toFixed(2), firstSeen: ev.firstSeen };
  subject.topSignal = SIGNAL_LABEL[largest.feature](labelData);

  return {
    subjectId: `subject_${q.p}`,
    verdictLabel:
      subject.status === "suppressed"
        ? "SUPPRESSED"
        : risk >= 90
          ? "CRITICAL"
          : risk >= 70
            ? "HIGH"
            : risk >= 45
              ? "ELEVATED"
              : "LOW",
    logitTotal,
    probability,
    risk,
    headline: subject.topSignal,
    contributions,
    checks: [
      { test: "precedence", result: q.verdict === "absent" ? "fail" : "pass", finding: q.verdict === "absent" ? "No context record precedes this activity." : "Context record precedes the activity by more than the 30-minute minimum." },
      { test: "provenance", result: q.verdict === "suspicious" ? "fail" : q.verdict === "absent" ? "fail" : "pass", finding: q.verdict === "suspicious" ? "Record was created by the subject of this investigation." : q.verdict === "absent" ? "No record to attribute." : "Assigned by an identity other than the subject." },
      { test: "scope", result: q.verdict === "partial" ? "warn" : q.verdict === "absent" ? "fail" : "pass", finding: q.verdict === "partial" ? "Record does not name the specific resource touched." : q.verdict === "absent" ? "No record to resolve against." : "Record names the resource touched." },
      { test: "proportionality", result: q.res > stats.median * 3 ? "warn" : "pass", finding: q.res > stats.median * 3 ? `Volume exceeds the 95th percentile for this work class (${q.res} vs cohort median ${stats.median}).` : "Volume is plausible for the scope of work described." },
    ],
    comparison: {
      metric: "Distinct resources touched",
      caption: `${stats.n} peers in ${q.cohort}, excluding this subject. Median ${stats.median} resources, MAD ${stats.mad}.`,
      subjectValue: q.res,
      stats,
      zScore: z,
    },
    attackPath: { nodes: [], edges: [] },
    evidence: [],
    sensorNote: q.sensor ? undefined : "Sensor not deployed on this identity; two detectors unavailable — presence divergence and composition drift.",
  };
}

const reduced = QUEUE.filter((q) => !["4912", "2071"].includes(q.p)).map(buildReducedDossier);

/* ------------------------------------- trajectories for the reduced rows */

/**
 * A judge will click row 2, not row 1. So every queue row gets a real
 * investigation page - timeline, attack path and evidence - not just the three
 * authored scenarios.
 *
 * These are built from one action template per dominant detector, so the path
 * on the page is the path the top signal describes. Each step carries the
 * empirical transition probability into it, authored per template.
 *
 * Note what is deliberately NOT derived here. Session perplexity, printed in
 * the contribution table, is a geometric mean over the whole session - tens of
 * transitions. The attack path shows a four-step excerpt. Tying the two by
 * `perplexity = (product of p) ^ (-1/n)` over the excerpt would print a false
 * identity, and on a benign subject it forces an absurdly improbable edge onto
 * a path whose own labels say it is ordinary work. So the two numbers are left
 * as what they are: a session statistic, and three transition probabilities.
 *
 * The risk curve does end on the score the rest of the page prints, and it
 * rises only at events.
 */

const TRAJECTORY_TEMPLATES = {
  deception: {
    start: 138,
    steps: [
      ["okta.session.start", "Service credential · CI runner", "low"],
      ["aws.sts.assume_role", "ci-deploy-svc-legacy · decoy credential", "critical", 6, 0.0002, true],
      ["github.repo.clone", "ledger-api · first ever", "critical", 11, 0.31, false, true],
      ["jenkins.job.trigger", "deploy-ledger-api · outside change window", "high", 19, 0.24],
    ],
  },
  presence: {
    start: 201,
    steps: [
      ["okta.session.start", "Corporate ASN · endpoint reported locked", "medium"],
      ["aws.ssm.start_session", "bastion-01 · session manager", "high", 7, 0.22],
      ["rds.snapshot.create", "payments-db · manual snapshot", "critical", 16, 0.04],
      ["aws.s3.put_object", "s3://ops-scratch-3311 · first ever", "critical", 24, 0.0007, true, true],
    ],
  },
  egress: {
    start: 612,
    steps: [
      ["okta.session.start", "Corporate ASN · Bengaluru", "low"],
      ["bigquery.job.query", "events.sessions · 41M rows scanned", "high", 22, 0.29],
      ["gcs.object.export", "gs://analytics-export · 2.1 GB", "critical", 38, 0.11],
      ["gcs.bucket.share", "Unaffiliated project · first ever", "critical", 51, 0.0003, true, true],
    ],
  },
  divergence: {
    start: 585,
    steps: [
      ["okta.session.start", "Corporate ASN · Pune", "low"],
      ["zendesk.ticket.bulk_export", "1,204 tickets · CSV", "high", 34, 0.16],
      ["gdrive.file.download", "Support — escalations Q3", "medium", 47, 0.44],
      ["gdrive.folder.share", "Link sharing enabled · first ever", "critical", 63, 0.006, true, true],
    ],
  },
  offHours: {
    start: 192,
    steps: [
      ["okta.session.start", "03:12 local · outside working envelope", "medium"],
      ["netsuite.report.run", "Vendor master · full extract", "high", 9, 0.21],
      ["netsuite.export.csv", "vendors_full.csv · 8,410 rows", "critical", 17, 0.33],
      ["gdrive.file.upload", "Personal drive · first ever", "critical", 28, 0.0009, true, true],
    ],
  },
  graph: {
    start: 628,
    steps: [
      ["okta.session.start", "Corporate ASN · Chennai", "low"],
      ["gws.mail.filter.create", "Auto-forward rule · external domain", "high", 14, 0.03],
      ["gws.mail.send_external", "4 unaffiliated domains · first ever", "critical", 26, 0.0005, true, true],
      ["gws.contact.export", "Directory export · 612 records", "medium", 40, 0.19],
    ],
  },
  privilege: {
    start: 505,
    steps: [
      ["okta.session.start", "Corporate ASN · Hyderabad", "low"],
      ["aws.iam.policy.put", "AdministratorAccess-scoped inline policy", "critical", 12, 0.02],
      ["aws.iam.role.attach", "svc-batch-runner · privilege widened", "high", 18, 0.47],
      ["aws.s3.get_object", "s3://finance-close-2026 · first ever", "medium", 31, 0.008, true, true],
    ],
  },
  composition: {
    start: 640,
    steps: [
      ["okta.session.start", "Corporate ASN · Bengaluru", "low"],
      ["gdrive.folder.list", "Shared — Data Platform", "low", 18, 0.51],
      ["gdrive.file.download", "214 files · 40 minutes", "high", 36, 0.28],
      ["dropbox.folder.sync", "Personal account · first ever", "critical", 58, 0.0012, true, true],
    ],
  },
  /* #3340 is authorised work on a newly enrolled device. Nothing in this path
     is improbable, and nothing in it is marked as though it were. */
  device: {
    start: 534,
    steps: [
      ["okta.session.start", "New device fingerprint · enrolment approved", "medium"],
      ["okta.mfa.challenge", "Push approved · enrolled device", "low", 4, 0.86],
      ["zendesk.ticket.update", "SUP-2214 · assigned queue", "low", 26, 0.39],
      ["confluence.page.view", "Support runbook — refunds", "low", 44, 0.42],
    ],
  },
  /* High volume under an authorising ticket. Nothing improbable in the shape —
     the finding is the amount, not the path. */
  bulk: {
    start: 549,
    steps: [
      ["okta.session.start", "Corporate ASN \u00b7 Bengaluru", "low"],
      ["zendesk.ticket.bulk_export", "96 tickets \u00b7 CSV, within ticket scope", "high", 27, 0.16],
      ["gdrive.file.download", "Support \u2014 refund audit pack", "medium", 44, 0.31],
      ["zendesk.macro.apply", "Bulk macro \u00b7 refund-followup", "low", 61, 0.44],
    ],
  },
  volumetric: {
    start: 561,
    steps: [
      ["okta.session.start", "Corporate ASN · Mumbai", "low"],
      ["netsuite.search.saved_run", "Open invoices · saved search", "low", 21, 0.47],
      ["netsuite.record.fetch", "Sequential record reads", "medium", 39, 0.62],
      ["netsuite.export.csv", "Close pack · 1 file", "high", 54, 0.09],
    ],
  },
};

/** Benign inhabitants of the trajectory lane, so a busy day reads as a busy day. */
const AMBIENT = [
  [570, "jira.issue.comment", "low"],
  [676, "slack.channel.message", "low"],
  [790, "confluence.page.view", "low"],
  [905, "jira.issue.transition", "low"],
  [1012, "github.pr.review", "low"],
];

const iso = (t) =>
  `2026-09-14T${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}:${String(
    (t * 7) % 60,
  ).padStart(2, "0")}Z`;

function buildTrajectory(q, dossier) {
  const template = TRAJECTORY_TEMPLATES[q.template ?? q.dominant ?? "volumetric"];
  const steps = template.steps.map(
    ([action, sublabel, sensitivity, dt = 0, probability = null, anomalous = false, firstEver = false]) => ({
      action,
      sublabel,
      sensitivity,
      t: template.start + dt,
      probability,
      anomalous,
      firstEver,
    }),
  );

  /* ---- attack path: the same four steps, hand-positioned left to right ---- */
  const nodes = steps.map((s, i) => ({
    id: `n${i}`,
    label: s.action,
    sublabel: s.sublabel,
    sensitivity: s.sensitivity,
    x: i * 200,
    y: 60,
  }));
  const edges = steps.slice(1).map((s, i) => ({
    from: `n${i}`,
    to: `n${i + 1}`,
    probability: s.probability,
    ...(s.anomalous ? { anomalous: true } : {}),
  }));

  /* ---- composite timeline ---- */
  const session = [
    {
      t: steps[0].t,
      ts: iso(steps[0].t),
      action: steps[0].action,
      sensitivity: steps[0].sensitivity,
      note: steps[0].sublabel,
      ...(q.ev.asn ? { asnChange: true, firstEver: true } : {}),
    },
  ];
  if (steps[1].action === "okta.mfa.challenge") {
    session.push({
      t: steps[1].t,
      ts: iso(steps[1].t),
      action: steps[1].action,
      sensitivity: steps[1].sensitivity,
      note: steps[1].sublabel,
    });
  }

  const actionSteps = steps.slice(1).filter((s) => !s.action.startsWith("okta."));
  const trajectory = [
    ...actionSteps.map((s) => ({
      t: s.t,
      ts: iso(s.t),
      action: s.action,
      resource: s.sublabel.split(" · ")[0],
      sensitivity: s.sensitivity,
      note: s.sublabel,
      ...(s.firstEver ? { firstEver: true } : {}),
    })),
    ...AMBIENT.filter(([t]) => Math.abs(t - steps[0].t) > 45).map(([t, action]) => ({
      t,
      ts: iso(t),
      action,
      sensitivity: "low",
    })),
  ].sort((a, b) => a.t - b.t);

  const first = actionSteps[0].t;
  const last = actionSteps[actionSteps.length - 1].t;
  const context =
    q.verdict === "authorised"
      ? [
          {
            from: 0,
            to: 1439,
            recordId: `TICKET-${3000 + Number(q.p) % 900}`,
            label: "Scope-matched ticket · assigned by another identity",
            verdict: "authorised",
          },
        ]
      : q.verdict === "partial"
        ? [
            {
              from: Math.max(0, first - 150),
              to: Math.round((first + last) / 2),
              recordId: `TICKET-${3000 + Number(q.p) % 900}`,
              label: "On-call rotation · scope does not name the resource touched",
              verdict: "partial",
            },
          ]
        : [];

  const base = Math.max(5, Math.round(q.risk * 0.18));
  const risk = [{ t: 0, risk: base }, { t: first - 1, risk: base }];
  actionSteps.forEach((s, i) => {
    const share = (i + 1) / actionSteps.length;
    risk.push({ t: s.t, risk: Math.round(base + (q.risk - base) * share) });
  });
  risk.push({ t: 1439, risk: q.risk });

  /* ---- evidence: metadata only, never content (PRD §7.5) ---- */
  const evidence = [
    {
      id: `ev-${q.p}-1`,
      ts: iso(steps[0].t),
      kind: "Identity",
      detail: `${steps[0].action} — ${steps[0].sublabel}`,
      source: "Okta",
    },
    ...actionSteps.map((s, i) => ({
      id: `ev-${q.p}-${i + 2}`,
      ts: iso(s.t),
      kind: "Action",
      detail: `${s.action} — ${s.sublabel}`,
      source: s.action.startsWith("aws.")
        ? "AWS CloudTrail"
        : s.action.startsWith("github.") || s.action.startsWith("jenkins.")
          ? "GitHub Enterprise"
          : s.action.startsWith("gws.") || s.action.startsWith("gdrive.") || s.action.startsWith("gcs.")
            ? "Google Workspace"
            : "Jira",
    })),
  ];
  if (context.length > 0) {
    evidence.push({
      id: `ev-${q.p}-ctx`,
      ts: iso(Math.max(1, context[0].from)),
      kind: "Context record",
      detail: `${context[0].recordId} — ${context[0].label}`,
      source: "Jira",
    });
  }
  if (q.sensor && q.ev.presenceActions) {
    evidence.push({
      id: `ev-${q.p}-pr`,
      ts: iso(steps[0].t),
      kind: "Presence",
      detail: `Endpoint reported locked across ${q.ev.presenceActions} authenticated actions`,
      source: "Sensor",
    });
  }
  evidence.push({
    id: `ev-${q.p}-bl`,
    ts: "2026-08-03T00:00:00Z",
    kind: "Baseline",
    detail: `Anchor window 60–90d frozen; cohort median ${dossier.comparison.stats.median} resources (MAD ${dossier.comparison.stats.mad})`,
    source: "tellTale",
  });

  dossier.attackPath = { nodes, edges };
  dossier.evidence = evidence;

  return { subjectId: `subject_${q.p}`, session, trajectory, context, risk };
}

const queueTimelines = QUEUE.filter((q) => !["4912", "2071"].includes(q.p)).map((q) =>
  buildTrajectory(
    q,
    reduced.find((d) => d.subjectId === `subject_${q.p}`),
  ),
);

/* ------------------------------------------------- suppression log (~40) */

const SUPPRESSION_REASONS = [
  { code: "SCOPE_MATCHED_TICKET", label: "Scope-matched ticket", source: "Jira" },
  { code: "ON_CALL_ROTATION", label: "On-call rotation", source: "PagerDuty" },
  { code: "APPROVED_TRAVEL", label: "Approved travel", source: "Workday" },
  { code: "ROLE_CHANGE", label: "Role change", source: "Workday" },
  { code: "NEW_DEVICE_APPROVED", label: "New device enrolment", source: "Okta" },
];
const SUPPRESSED_ANOMALIES = [
  "First-ever repository access",
  "Off-hours authentication",
  "Volumetric deviation, Z = +3.4",
  "Unseen ASN",
  "Bulk permission read",
  "Cross-department graph edge",
  "Composition drift, JSD 0.21",
  "New device fingerprint",
  "Archive creation, 62 files",
  "External share created",
];

const nonQueue = subjects.filter((s) => !QUEUE.some((q) => `#${q.p}` === s.pseudonym));
const suppressions = [];
for (let i = 0; i < 39; i++) {
  const s = nonQueue[Math.floor(rand() * nonQueue.length)];
  const reason = pick(SUPPRESSION_REASONS);
  const hh = String(int(0, 19)).padStart(2, "0");
  const mm = String(int(0, 59)).padStart(2, "0");
  const ch = String(Math.max(0, int(0, 19) - int(1, 8))).padStart(2, "0");
  suppressions.push({
    id: `sup-${String(i + 1).padStart(3, "0")}`,
    ts: `2026-09-14T${hh}:${mm}:${String(int(0, 59)).padStart(2, "0")}Z`,
    subjectPseudonym: s.pseudonym,
    anomaly: pick(SUPPRESSED_ANOMALIES),
    suppressedBy: reason.source,
    reasonCode: reason.code,
    reviewable: true,
    record: {
      recordId: `${reason.code === "SCOPE_MATCHED_TICKET" ? "TICKET" : reason.code === "ON_CALL_ROTATION" ? "ROTA" : "HR"}-${int(1000, 9999)}`,
      createdBy: `subject_${int(1000, 9999)}`,
      createdAt: `2026-09-${pick(["12", "13", "14"])}T${ch}:${String(int(0, 59)).padStart(2, "0")}:00Z`,
      scope: pick(["payments-core", "ledger-api", "billing-web", "infra-terraform", "support-tooling", "analytics-dbt"]),
    },
  });
}
suppressions.sort((a, b) => (a.ts < b.ts ? 1 : -1));

// Priya's suppression — the one the demo points at.
suppressions.unshift({
  id: "sup-000",
  ts: "2026-09-14T10:15:41Z",
  subjectPseudonym: "#8830",
  anomaly: "First-ever repository access — payments-core",
  suppressedBy: "Jira",
  reasonCode: "SCOPE_MATCHED_TICKET",
  reviewable: true,
  record: {
    recordId: "TICKET-4471",
    createdBy: "subject_5530",
    createdAt: "2026-09-13T09:12:00Z",
    scope: "payments-core",
  },
});

// The UNDER REVIEW row: a suppression later found to rest on manufactured
// context. Links to Dana and closes the loop (PRD §5.5).
suppressions.splice(3, 0, {
  id: "sup-rev",
  ts: "2026-09-14T14:47:09Z",
  subjectPseudonym: "#2071",
  anomaly: "First-ever repository access — payments-core",
  suppressedBy: "Jira",
  reasonCode: "SCOPE_MATCHED_TICKET",
  reviewable: true,
  underReview: true,
  record: {
    recordId: "TICKET-9920",
    createdBy: "subject_2071",
    createdAt: "2026-09-14T14:07:00Z",
    scope: "payments-core",
  },
  linkedSubjectId: "subject_2071",
});

/* ------------------------------------------- workforce module (18 people) */

const WF_NAMES = [
  ["Rhea Kulkarni", "Platform"], ["Tomas Berg", "Platform"], ["Imani Osei", "Platform"],
  ["Devan Rao", "Product Engineering"], ["Lucia Ferrari", "Product Engineering"],
  ["Noor Haddad", "Product Engineering"], ["Elias Kowalski", "Product Engineering"],
  ["Mira Lindqvist", "Data"], ["Chen Wei-Lin", "Data"], ["Kofi Mensah", "Data"],
  ["Sanne de Vries", "Finance Systems"], ["Arjun Pillai", "Finance Systems"],
  ["Yara Nasser", "Customer Operations"], ["Peter Ondrej", "Customer Operations"],
  ["Hana Takeda", "Customer Operations"], ["Gabriel Santos", "Security Engineering"],
  ["Freya Halvorsen", "Security Engineering"], ["Omar Belkacem", "IT Operations"],
];
const WF_APPS = [
  { application: "Visual Studio Code", category: "development", titles: ["payments-core — src/ledger", "billing-web — components", "infra-terraform — modules"] },
  { application: "Google Chrome", category: "browser", titles: ["Internal wiki — Runbooks", "Grafana — service dashboards", "Jira — sprint board"] },
  { application: "Slack", category: "communication", titles: ["#platform-oncall", "#product-eng", "#incident-2291"] },
  { application: "Finder", category: "file management", titles: ["Downloads", "Documents — Q3", "Shared — Finance"] },
  { application: "Workday", category: "administrative", titles: ["Timesheets", "Expense report", "Team directory"] },
  { application: "iTerm2", category: "development", titles: ["ssh bastion-01", "kubectl — staging", "psql ledger"] },
  { application: "Figma", category: "other", titles: ["Console — queue redesign", "Design system"] },
];

/*
 * Working and idle minutes are SUMMED FROM the hour slots rather than picked
 * independently. Before this, the org table said 10h 55m and the member day
 * view's own hour table added up to 9h 45m, and the donut said 10h 56m — three
 * numbers for one quantity on two screens. The hour slots are the primary
 * record here; everything else is derived from them.
 */
const members = WF_NAMES.map(([name, team], i) => {
  const ribbon = Array.from({ length: 24 }, (_, h) => {
    if (h < 8 || h > 19) return "offline";
    if (h === 13) return "idle";
    return rand() < 0.16 ? "idle" : "active";
  });

  const hourSlots = Array.from({ length: 12 }, (_, j) => {
    const h = 8 + j;
    const state = ribbon[h];
    const w = state === "active" ? int(42, 60) : state === "idle" ? int(0, 12) : 0;
    return { hour: `${String(h).padStart(2, "0")}:00`, workingMinutes: w, idleMinutes: 60 - w };
  });

  return {
    id: `emp-${String(i + 1).padStart(3, "0")}`,
    name,
    team,
    workingMinutes: hourSlots.reduce((a, x) => a + x.workingMinutes, 0),
    idleMinutes: hourSlots.reduce((a, x) => a + x.idleMinutes, 0),
    topApplication: pick(WF_APPS).application,
    lastSeen: `2026-09-14T${String(int(17, 19)).padStart(2, "0")}:${String(int(0, 59)).padStart(2, "0")}:00Z`,
    sensorEquipped: i < 15,
    ribbon,
    hourSlots,
  };
});

const memberDays = members.map((m) => {
  const cats = ["development", "browser", "communication", "file management", "administrative", "other"];
  const raw = cats.map(() => 20 + rand() * 120);
  const scale = m.workingMinutes / raw.reduce((a, b) => a + b, 0);
  const categoryTime = cats.map((category, i) => ({ category, minutes: Math.round(raw[i] * scale) }));
  /* Rounding six shares independently loses a minute or two. The donut prints
     this sum next to the working total, so the drift has to go somewhere
     explicit rather than into a discrepancy a judge can spot. */
  const drift = m.workingMinutes - categoryTime.reduce((a, c) => a + c.minutes, 0);
  categoryTime[categoryTime.length - 1].minutes += drift;

  const apps = [];
  for (const app of WF_APPS) {
    for (const title of app.titles.slice(0, int(1, app.titles.length))) {
      apps.push({ application: app.application, windowTitle: title, category: app.category, minutes: int(8, 95) });
    }
  }
  apps.sort((a, b) => b.minutes - a.minutes);

  return { memberId: m.id, categoryTime, applications: apps.slice(0, 9), hourSlots: m.hourSlots };
});

/* ---------------------------------------------------- captures and usage */

/**
 * Six captures per Sensor-equipped member on the pinned day. Cloud-only
 * endpoints produce none at all, which is what makes the tiering visible on
 * this screen as well as on the investigation pages.
 *
 * `seed` drives the generated placeholder panel. There is no image file
 * anywhere in this repository, so it is not possible for a real screenshot to
 * reach the build by accident (PRD §7.4).
 */
const captures = [];
for (const m of members.filter((x) => x.sensorEquipped)) {
  for (let k = 0; k < 6; k += 1) {
    const minute = 9 * 60 + k * 115 + int(0, 40);
    const app = pick(WF_APPS);
    captures.push({
      id: `cap-${String(captures.length + 1).padStart(4, "0")}`,
      memberId: m.id,
      memberName: m.name,
      ts: `2026-09-14T${String(Math.floor(minute / 60)).padStart(2, "0")}:${String(minute % 60).padStart(
        2,
        "0",
      )}:00Z`,
      mode: rand() < 0.12 ? "triggered" : "scheduled",
      application: app.application,
      seed: int(10000, 99999),
      flagged: rand() < 0.08,
    });
  }
}
captures.sort((a, b) => a.ts.localeCompare(b.ts));

/** The application with the most recorded time in each hour of the working day. */
const hourlyTopApp = Array.from({ length: 12 }, (_, i) => {
  const app = pick(WF_APPS);
  return {
    hour: `${String(8 + i).padStart(2, "0")}:00`,
    application: app.application,
    category: app.category,
    members: int(3, 16),
    minutes: int(120, 620),
  };
});

/* ------------------------------------------------------------------ emit */

const banner = `/**
 * GENERATED by scripts/generate-population.mjs — do not edit by hand.
 * Committed deliberately: nothing randomises at runtime, so the numbers in the
 * demo video and the numbers a judge sees are the same numbers (PRD §6).
 */`;

const populationTs = `${banner}
import type { CohortStats, Subject } from "./types";

export const SUBJECTS: Subject[] = ${JSON.stringify(subjects, null, 2)};

/** Peer-group statistics per cohort: median and MAD, master doc §2.3. */
export const COHORT_STATS: CohortStats[] = ${JSON.stringify(COHORT_STATS, null, 2)};

export const SENSOR_COVERAGE = { equipped: ${sensorCount}, total: ${subjects.length} } as const;

/** Backend Engineering peer group — the distribution behind all three scenario pages. */
export const BACKEND_PEERS: CohortStats = ${JSON.stringify(BE_PEER_STATS, null, 2)};

export function subjectById(id: string): Subject | undefined {
  return SUBJECTS.find((s) => s.id === id);
}
`;

const dossiersTs = `${banner}
import type { Dossier } from "./types";

/**
 * Reduced dossiers for the queue rows that are not one of the three authored
 * scenarios. Every judge who clicks a queue row lands on a real page whose
 * contribution column sums correctly — see scripts/verify-fixtures.mjs.
 */
export const QUEUE_DOSSIERS: Dossier[] = ${JSON.stringify(reduced, null, 2)};
`;

const suppressionsTs = `${banner}
import type { Suppression } from "./types";

/** Suppressed, not discarded (PRD §5.5). One row is UNDER REVIEW. */
export const SUPPRESSIONS: Suppression[] = ${JSON.stringify(suppressions, null, 2)};

export const SUPPRESSION_REASON_LABELS: Record<string, string> = ${JSON.stringify(
  Object.fromEntries(SUPPRESSION_REASONS.map((r) => [r.code, r.label])),
  null,
  2,
)};
`;

const workforceTs = `${banner}
import type { ApplicationUse, Capture, CategoryTime, HourSlot, WorkforceMember } from "./types";

/**
 * Workforce module. Named employees, working time, usage, captures — and no
 * risk score anywhere in this file, by design (PRD §7.1). Categories are
 * reported as time by category; nothing here is labelled productive (PRD §7.2).
 */
export const MEMBERS: WorkforceMember[] = ${JSON.stringify(
  // hourSlots live on MEMBER_DAYS, not on the member row.
  members.map((m) => {
    const row = { ...m };
    delete row.hourSlots;
    return row;
  }),
  null,
  2,
)};

export interface MemberDay {
  memberId: string;
  categoryTime: CategoryTime[];
  applications: ApplicationUse[];
  hourSlots: HourSlot[];
}

export const MEMBER_DAYS: MemberDay[] = ${JSON.stringify(memberDays, null, 2)};

export const CAPTURES: Capture[] = ${JSON.stringify(captures, null, 2)};

export const HOURLY_TOP_APPLICATION = ${JSON.stringify(hourlyTopApp, null, 2)} as const;

export function memberById(id: string): WorkforceMember | undefined {
  return MEMBERS.find((m) => m.id === id);
}
export function memberDayById(id: string): MemberDay | undefined {
  return MEMBER_DAYS.find((d) => d.memberId === id);
}
`;

const queueTimelinesTs = `${banner}
import type { CompositeTimeline } from "./types";

/**
 * Composite timelines for the queue rows that are not one of the three authored
 * scenarios, so every row a judge clicks has a populated timeline lane set.
 * Built from one action template per dominant detector — see the generator.
 */
export const QUEUE_TIMELINES: CompositeTimeline[] = ${JSON.stringify(queueTimelines, null, 2)};
`;

const outDir = path.resolve("src/lib/fixtures");
await fs.writeFile(path.join(outDir, "population.ts"), populationTs, "utf8");
await fs.writeFile(path.join(outDir, "queue-dossiers.ts"), dossiersTs, "utf8");
await fs.writeFile(path.join(outDir, "queue-timelines.ts"), queueTimelinesTs, "utf8");
await fs.writeFile(path.join(outDir, "suppressions.ts"), suppressionsTs, "utf8");
await fs.writeFile(path.join(outDir, "workforce.ts"), workforceTs, "utf8");
console.log(`suppressions: ${suppressions.length} (1 under review)`);
console.log(`workforce: ${members.length} members, ${captures.length} captures`);

console.log(`population: ${subjects.length} subjects, sensor ${sensorCount}/100`);
console.log(`backend peers: n=${BE_PEER_STATS.n} median=${BE_PEER_STATS.median} mad=${BE_PEER_STATS.mad}`);
console.log(`cohort totals: ${COHORT_STATS.map((c) => `${c.cohort}=${c.n}`).join(", ")}`);
console.log(`reduced dossiers: ${reduced.length}, timelines: ${queueTimelines.length}`);
console.log(`all-cohort BE stats (incl. scenarios): median=${BE_STATS.median} mad=${BE_STATS.mad} n=${BE_STATS.n}`);
