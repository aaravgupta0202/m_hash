import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  Layers3,
  Route,
  Shield,
  ShieldCheck,
  Activity,
  GitBranch,
  TrendingUp,
  FileCheck2,
  ListOrdered,
  Lock,
} from "lucide-react";
import { LandingHeader } from "@/components/landing/landing-header";
import { ScoreDiagram } from "@/components/landing/score-diagram";
import { ScenarioComparison } from "@/components/landing/scenario-comparison";
import { DetectionPrimitives } from "@/components/landing/detection-primitives";
import { PricingSection } from "@/components/landing/pricing-section";
import { LogoMark } from "@/components/brand/logo-mark";
import { BrandIcon } from "@/components/brand-icon";
import {
  ESCALATED_ANOMALIES,
  INVESTIGATIONS,
  RAISED_ANOMALIES,
  STAT_TILES,
  SUPPRESSED_BY_CONTEXT,
} from "@/lib/fixtures";

export const metadata: Metadata = {
  title: "tellTale - Behavioural Transition Detection for Identity Threat & Insider Risk",
};

const CONNECTOR_LOGOS = [
  "Okta",
  "Google Workspace",
  "GitHub",
  "AWS CloudTrail",
  "Jira",
  "Confluence",
  "Slack",
  "PagerDuty",
  "Dropbox",
  "Jenkins",
];

const FIVE_QUESTIONS = [
  {
    step: "01",
    icon: Activity,
    title: "Is the volume different?",
    body: "Robust per-user baselines using median and median absolute deviation (MAD). Will not get dragged around by a single busy day.",
    math: "Median & MAD",
  },
  {
    step: "02",
    icon: GitBranch,
    title: "Is the path improbable?",
    body: "Sequence of actions scored against empirical transition probabilities. Evaluates how often action C follows B follows A across your org.",
    math: "Order-2 Markov",
  },
  {
    step: "03",
    icon: TrendingUp,
    title: "Is this person drifting from peers?",
    body: "Cohort divergence against a fixed historical anchor, catching the slow burn that a moving rolling window structurally misses.",
    math: "Anchored CUSUM",
  },
  {
    step: "04",
    icon: FileCheck2,
    title: "Did the organisation ask for this?",
    body: "Scope-verified context: a ticket authorising this specific resource, assigned by someone else, before the activity began.",
    math: "4-Test Context Gate",
  },
  {
    step: "05",
    icon: ListOrdered,
    title: "How does this rank against today's work?",
    body: "Calibrated probability multiplied by asset criticality weight (Priority score). Focuses human attention on real enterprise exposure.",
    math: "Priority Score",
  },
];

const THREE_FAILURES = [
  {
    num: "1",
    title: "Point-in-time thresholding",
    body: "Traditional tools compute rolling averages and alert on single-event spikes. They are blind to action sequence (download → archive → upload) and self-poison on slow-burn attacks over 60 days.",
  },
  {
    num: "2",
    title: "Context blindness",
    body: "Security telemetry and operational reality live in silos. A Jira ticket or on-call rotation authorising an action is one API call away, but legacy tools only ingest syslog lines.",
  },
  {
    num: "3",
    title: "The explainability deficit",
    body: "Legacy systems emit opaque scalar scores (Risk: 87). Reconstructing what happened takes an analyst 2 to 4 hours per alert, leading to alert fatigue and ignored queues.",
  },
];

export default function LandingPage() {
  return (
    <>
      <LandingHeader />

      <main>
        {/* ---- Hero (Master Doc Cover & Thesis) ------------------------- */}
        <section className="mx-auto w-full max-w-[1600px] px-6 pt-12 pb-14 sm:px-10 sm:pt-16 sm:pb-20 lg:px-16">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 shadow-xs">
                  <span className="size-1.5 rounded-full bg-emerald-600" />
                  Made by Team 001 for M# 2026
                </span>
                <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                  Silent Shift: Detecting the Insider Before the Incident
                </span>
              </div>

              <h1 className="text-4xl leading-[1.15] font-semibold tracking-tight text-ink sm:text-5xl">
                Security tools alarm on events. <br className="hidden sm:inline" />
                <span className="text-emerald-700">tellTale scores the change in direction.</span>
              </h1>

              {/* The Ribbon Metaphor Quote from Master Doc Page 1 */}
              <div className="mt-5 border-l-2 border-emerald-600 pl-4 py-1 text-slate-600 text-sm italic leading-relaxed">
                &ldquo;A telltale is the ribbon on a sail. It does not tell you the wind is blowing; you already know that. It tells you the airflow has changed direction, seconds before the sail stalls.&rdquo;
              </div>

              <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-slate-600">
                Behavioural transition detection for identity threat and insider risk: context-aware, agentless, and explainable by construction.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  href="/demo"
                  className="flex items-center gap-2 rounded-md bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-emerald-700"
                >
                  Try the interactive demo
                  <ArrowRight className="size-4" />
                </Link>
                <Link
                  href="/demo/about"
                  className="flex items-center gap-2 rounded-md border border-line bg-white px-5 py-2.5 text-sm font-medium text-slate-800 transition-colors hover:bg-slate-50"
                >
                  Read the methodology
                </Link>
              </div>

              <p className="mt-4 text-xs text-slate-500">
                No signup required. Interactive demo runs on synthetic data (nothing you touch is real).
              </p>
            </div>

            <div className="panel flex items-center justify-center p-8 bg-white border border-line shadow-xs">
              <ScoreDiagram />
            </div>
          </div>
        </section>

        {/* ---- The Problem & Reconciliation Descent (Master Doc §1.2) ---- */}
        <section className="border-y border-line bg-slate-50/60">
          <div className="mx-auto w-full max-w-[1600px] px-6 py-12 sm:px-10 lg:px-16">
            <div className="max-w-3xl">
              <p className="label text-emerald-700">The Problem</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
                Most access anomalies are normal work wearing a scary label.
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Legacy tools miss the silent shift because of three architectural failures:
              </p>
            </div>

            {/* Three Failures Grid */}
            <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">
              {THREE_FAILURES.map((f) => (
                <div key={f.title} className="panel p-5 bg-white border border-line rounded-lg shadow-xs">
                  <span className="flex size-6 items-center justify-center rounded-full bg-emerald-50 text-xs font-bold text-emerald-800 border border-emerald-200">
                    {f.num}
                  </span>
                  <h3 className="mt-3 text-sm font-bold text-ink">{f.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600">{f.body}</p>
                </div>
              ))}
            </div>

            {/* The Descent in Real Numbers */}
            <div className="mt-10 pt-8 border-t border-line">
              <p className="label text-slate-500 mb-4">Reconciled Alert Descent</p>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <Descent value={RAISED_ANOMALIES.toLocaleString("en-US")} label="Raised anomalies" />
                <Descent
                  value={SUPPRESSED_BY_CONTEXT.toLocaleString("en-US")}
                  label="Filtered by verified context"
                />
                <Descent value={String(ESCALATED_ANOMALIES)} label="Flagged for review" />
                <Descent
                  value={STAT_TILES.find((t) => t.label === "Confirmed findings")?.value ?? "3"}
                  label="Confirmed findings"
                />
              </div>
              <p className="mt-4 text-xs text-slate-500">
                {INVESTIGATIONS} investigations opened, exactly three confirmed findings. Alerts are prioritized by Priority score (calibrated probability × asset criticality).
              </p>
            </div>
          </div>
        </section>

        {/* ---- Core Thesis: 5 Questions (Master Doc §1.3) ----------------- */}
        <section id="how-it-works" className="mx-auto w-full max-w-[1600px] px-6 py-16 sm:px-10 sm:py-20 lg:px-16">
          <p className="label text-emerald-700">Core Thesis</p>
          <h2 className="mt-2 max-w-2xl text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            Score the transition, not the event.
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600">
            tellTale replaces the unit of analysis. We do not score single actions: we score the directional shift in an identity’s behaviour, evaluated against their historical anchor, their cohort, and verified against whether the organisation actually authorized it.
          </p>

          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {FIVE_QUESTIONS.map((q) => (
              <div key={q.step} className="panel p-5 bg-white border border-line rounded-lg shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-emerald-700">{q.step}</span>
                    <span className="font-mono text-[10px] text-slate-400 font-semibold">{q.math}</span>
                  </div>
                  <h3 className="mt-3 text-sm font-bold text-ink">{q.title}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-600">{q.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ---- 7 Detection Primitives & 4-Test Context Gate (§1.6 & §1.7) -- */}
        <DetectionPrimitives />

        {/* ---- Three Users, One Identical Command (Master Doc §1.8) ------ */}
        <ScenarioComparison />

        {/* ---- Two Modules & 4 Workforce Screens (Master Doc §1.10.2) --- */}
        <section id="modules" className="border-t border-line bg-slate-50/60">
          <div className="mx-auto w-full max-w-[1600px] px-6 py-16 sm:px-10 sm:py-20 lg:px-16">
            <div className="max-w-3xl">
              <p className="label text-emerald-700">Two Modules, Strictly Separated</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
                Security threat detection and workforce reporting, separated by architectural invariants.
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                A product that measures output and accuses employees of theft is a configuration mistake away from harm. tellTale enforces strict separation at the feature-extraction boundary and role grants.
              </p>
            </div>

            <div className="mt-9 grid grid-cols-1 gap-6 lg:grid-cols-2">
              <ModuleCard
                icon={Shield}
                title="Security Module"
                tagline="Pseudonymous threat detection for Security Analysts"
                items={[
                  "Review alerts: Ranked by priority score (risk × asset criticality) with daily capacity budgeting.",
                  "Composite timeline: 4 lanes (auth, trajectory, context records, risk over time) on a shared axis.",
                  "App connections: Per-source heartbeats with expected-volume bands to detect telemetry starvation.",
                  "Approved activity: Auditable suppression log recording reason codes for every filtered anomaly.",
                ]}
                href="/demo"
                cta="Open security alerts"
              />
              <ModuleCard
                icon={Briefcase}
                title="Workforce Module"
                tagline="Operational team visibility for Workforce Administrators"
                items={[
                  "Team overview: Named employees across departments with active/idle hours and 24h activity ribbons.",
                  "App usage: Interactive category donut chart and searchable table across all applications in use.",
                  "Screen captures: 5-minute scheduled captures and triggered forensic captures with 4 review flags.",
                  "Member profile: Comprehensive operational workday deep-dive for an employee.",
                ]}
                href="/demo/workforce"
                cta="Open workforce activity"
              />
            </div>

            {/* The 3 Governance Invariants (Master Doc §1.10.2 Page 13) */}
            <div className="mt-8 rounded-lg border border-line bg-white p-6 shadow-xs">
              <div className="flex items-center gap-2 mb-3">
                <Lock className="size-4 text-emerald-700" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                  The Three Governance Invariants (PRD §7)
                </h4>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3 text-xs leading-relaxed text-slate-600">
                <div className="border-t border-line pt-2">
                  <span className="font-semibold text-slate-900">Rule 1: No Productivity in Risk. </span>
                  Subjective productive/unproductive labels are excluded from every risk calculation at the feature boundary. The model never receives the column.
                </div>
                <div className="border-t border-line pt-2">
                  <span className="font-semibold text-slate-900">Rule 2: Role Separation. </span>
                  Workforce Admins see named employees and timesheets with zero access to risk scores. Security Analysts see pseudonyms (#4912) with zero access to productivity ratings.
                </div>
                <div className="border-t border-line pt-2">
                  <span className="font-semibold text-slate-900">Rule 3: Pseudonymous Investigations. </span>
                  Bridging from a pseudonymous security alert to an employee’s real identity requires a two-person dual-custody unmasking workflow (CISO + Legal/HR approval).
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ---- Pricing & Business Strategy (Master Doc §4.4 & §4.10) ------ */}
        <PricingSection />

        {/* ---- Works with your stack --------------------------------------- */}
        <section className="mx-auto w-full max-w-[1600px] px-6 py-14 sm:px-10 lg:px-16">
          <p className="label text-center text-slate-500">Works with tools you already use</p>
          <div className="mt-7 grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3 md:grid-cols-5">
            {CONNECTOR_LOGOS.map((name) => (
              <div key={name} className="flex items-center justify-center gap-2 text-slate-600">
                <BrandIcon name={name} className="size-4 shrink-0" />
                <span className="text-xs font-medium">{name}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ---- Honesty ------------------------------------------------------ */}
        <section className="border-t border-line">
          <div className="mx-auto w-full max-w-[1600px] px-6 py-16 sm:px-10 sm:py-20 lg:px-16">
            <div className="panel flex flex-col gap-6 p-8 sm:flex-row sm:items-center sm:justify-between bg-white border border-line shadow-xs">
              <div className="max-w-xl">
                <p className="label text-amber-700">Demo build — all data synthetic</p>
                <h2 className="mt-2 text-xl font-semibold tracking-tight text-ink">
                  Fully verified and transparent.
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  Every score, timeline, and timestamp in this interactive demo is calculated and
                  checked for internal consistency by automated verification before building.
                  Made by Team 001 for M# 2026.
                </p>
              </div>
              <Link
                href="/demo"
                className="flex shrink-0 items-center gap-2 self-start rounded-md bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-emerald-700 sm:self-auto"
              >
                Try the demo now
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-line bg-white">
        <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-4 px-6 py-8 sm:px-10 lg:px-16 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white font-black text-xs shadow-xs">
              <LogoMark />
            </div>
            <span className="text-xs font-medium text-slate-600">
              tellTale: Made by Team 001 for M# 2026
            </span>
          </div>
          <div className="flex items-center gap-6 text-xs text-slate-600">
            <Link href="/demo" className="hover:text-emerald-700 transition-colors">
              Demo Console
            </Link>
            <Link href="/demo/about" className="hover:text-emerald-700 transition-colors">
              Methodology
            </Link>
          </div>
        </div>
      </footer>
    </>
  );
}

function Descent({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="machine text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
        {value}
      </p>
      <p className="mt-1 text-xs text-slate-500">{label}</p>
    </div>
  );
}

function ModuleCard({
  icon: Icon,
  title,
  tagline,
  items,
  href,
  cta,
}: {
  icon: typeof Shield;
  title: string;
  tagline: string;
  items: string[];
  href: string;
  cta: string;
}) {
  return (
    <div className="panel flex flex-col p-6 bg-white border border-line shadow-xs">
      <div className="flex items-center gap-2.5">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
          <Icon className="size-4" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-ink">{title}</h3>
          <p className="text-xs text-slate-500">{tagline}</p>
        </div>
      </div>
      <ul className="mt-4 space-y-2.5 text-sm leading-relaxed text-slate-600">
        {items.map((it) => (
          <li key={it} className="flex gap-2">
            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-emerald-600" />
            <span>{it}</span>
          </li>
        ))}
      </ul>
      <Link
        href={href}
        className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
      >
        {cta}
        <ArrowRight className="size-3.5" />
      </Link>
    </div>
  );
}
