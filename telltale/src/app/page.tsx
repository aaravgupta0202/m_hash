import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  Gauge,
  Layers3,
  Route,
  Shield,
  ShieldCheck,
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

const HOW_IT_WORKS = [
  {
    icon: Layers3,
    title: "Clear math, not a mystery black box",
    body: "Every check adds or subtracts from the alert score. The breakdown table is transparent so anyone can see why an alert was triggered without guesswork.",
  },
  {
    icon: ShieldCheck,
    title: "Automated checks against real work tickets",
    body: "We verify author, timing, and ticket scope automatically. If someone created a ticket to approve their own abnormal download, the system spots the conflict instantly.",
  },
  {
    icon: Gauge,
    title: "Smart baselines that ignore one-off outliers",
    body: "Team baselines use robust median statistics, not easily skewed averages. One person doing heavy data work does not throw off everyone else's normal activity range.",
  },
  {
    icon: Route,
    title: "Action patterns, not just single clicks",
    body: "We look at the whole sequence of actions, identifying unusual jumps between systems rather than judging single normal actions out of context.",
  },
];

export default function LandingPage() {
  return (
    <>
      <LandingHeader />

      <main>
        {/* ---- Hero ---------------------------------------------------- */}
        <section className="mx-auto w-full max-w-[1600px] px-6 pt-12 pb-14 sm:px-10 sm:pt-16 sm:pb-20 lg:px-16">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300 bg-emerald-50 px-3.5 py-1.5 text-xs font-bold text-emerald-800 shadow-xs mb-4">
                <span className="size-2 rounded-full bg-emerald-600" />
                Made by team 001 for M# 2026
              </div>
              <p className="label text-emerald-700">Behavioural Transition Detection</p>
              <h1 className="mt-3 text-4xl leading-[1.1] font-semibold tracking-tight text-ink sm:text-5xl">
                Security alerts that actually explain themselves.
              </h1>
              <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-slate-600">
                tellTale turns a flood of daily identity and access logs into the small number of
                alerts worth reviewing. For every case, see the exact evidence, timeline, and
                plain-English explanation right beside it, not hidden in a black box.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  href="/demo"
                  className="flex items-center gap-2 rounded-md bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-emerald-700"
                >
                  Try the demo
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

        {/* ---- The descent, in real numbers from the demo --------------- */}
        <section className="border-y border-line bg-slate-50/60">
          <div className="mx-auto w-full max-w-[1600px] px-6 py-12 sm:px-10 lg:px-16">
            <p className="label text-emerald-700">The problem</p>
            <h2 className="mt-2 max-w-2xl text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              Most alerts are normal work wearing a scary label.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">
              On-call rotations, approved tickets, and travel explain almost all initial flags.
              tellTale automatically checks the context and filters out the noise:
            </p>

            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Descent value={RAISED_ANOMALIES.toLocaleString("en-US")} label="Raised anomalies" />
              <Descent
                value={SUPPRESSED_BY_CONTEXT.toLocaleString("en-US")}
                label="Filtered by real context"
              />
              <Descent value={String(ESCALATED_ANOMALIES)} label="Flagged for review" />
              <Descent
                value={STAT_TILES.find((t) => t.label === "Confirmed findings")?.value ?? "3"}
                label="Confirmed findings"
              />
            </div>
            <p className="mt-4 text-xs text-slate-500">
              {INVESTIGATIONS} alerts opened this month, three confirmed. Alerts sort by priority
              score (risk multiplied by asset importance) so critical systems are addressed first.
            </p>
          </div>
        </section>

        {/* ---- How it works ---------------------------------------------- */}
        <section id="how-it-works" className="mx-auto w-full max-w-[1600px] px-6 py-16 sm:px-10 sm:py-20 lg:px-16">
          <p className="label text-emerald-700">How it works</p>
          <h2 className="mt-2 max-w-xl text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            Four simple ideas do all the heavy lifting.
          </h2>

          <div className="mt-9 grid grid-cols-1 gap-5 sm:grid-cols-2">
            {HOW_IT_WORKS.map((f) => (
              <div key={f.title} className="panel p-6 bg-white border border-line shadow-xs">
                <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                  <f.icon className="size-4.5" />
                </div>
                <h3 className="mt-3 text-base font-semibold text-ink">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{f.body}</p>
              </div>
            ))}
          </div>

          <Link
            href="/demo/about"
            className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
          >
            Read the full methodology
            <ArrowRight className="size-3.5" />
          </Link>
        </section>

        {/* ---- 7 Detection Primitives & 4 Context Tests ------------------- */}
        <DetectionPrimitives />

        {/* ---- Section 1.8: Three Users, One Identical Command ------------ */}
        <ScenarioComparison />

        {/* ---- Two modules ------------------------------------------------ */}
        <section id="modules" className="border-t border-line bg-slate-50/60">
          <div className="mx-auto w-full max-w-[1600px] px-6 py-16 sm:px-10 sm:py-20 lg:px-16">
            <p className="label text-emerald-700">Two modules, strictly separated</p>
            <h2 className="mt-2 max-w-2xl text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              Security alerts and workforce activity are kept separate by design.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">
              Security alerts remain anonymous until two authorized team members agree to unmask an identity.
              Workforce activity tracking is operational and carries no security scores.
            </p>

            <div className="mt-9 grid grid-cols-1 gap-6 lg:grid-cols-2">
              <ModuleCard
                icon={Shield}
                title="Security Alerts"
                tagline="Anonymous, evidence-based alerts"
                items={[
                  "Prioritized alert queue ranked by operational impact",
                  "Connected app health monitoring across all systems",
                  "Auto-approved activity log with audit tracking",
                ]}
                href="/demo"
                cta="Open security alerts"
              />
              <ModuleCard
                icon={Briefcase}
                title="Workforce Activity"
                tagline="Operational team visibility, no risk scoring"
                items={[
                  "Team overview with working hours and active members",
                  "Application usage breakdown by tool and category",
                  "Screen capture gallery with search and sort controls",
                ]}
                href="/demo/workforce"
                cta="Open workforce activity"
              />
            </div>
          </div>
        </section>

        {/* ---- Section 4.4: Pricing & Packaging --------------------------- */}
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
