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
  title: "tellTale — Context-aware behavioural detection",
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
    title: "The score is a sum, not a black box",
    body: "Each detector contributes a signed number to a log-odds total. The contribution table is the model — there's no separate attribution step run after the fact to explain a number nobody can see the origin of.",
  },
  {
    icon: ShieldCheck,
    title: "Context verification, four tests deep",
    body: "Precedence, provenance, scope match, proportionality. A ticket that exists but was created by the subject it would authorise doesn't get a pass — it gets flagged as the strongest signal on the page.",
  },
  {
    icon: Gauge,
    title: "Robust statistics, not a shaky average",
    body: "Cohort baselines are median and median absolute deviation, not mean and standard deviation — so the one person who touches 400 resources in a day doesn't drag the whole team's baseline with them.",
  },
  {
    icon: Route,
    title: "Trajectory, not just destination",
    body: "An order-2 Markov model scores how unusual a whole sequence of actions is for this organisation, not only whether the last action looks bad in isolation.",
  },
];

export default function LandingPage() {
  return (
    <>
      <LandingHeader />

      <main>
        {/* ---- Hero ---------------------------------------------------- */}
        <section className="mx-auto max-w-6xl px-6 pt-16 pb-14 sm:pt-24 sm:pb-20">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <div>
              <p className="label text-purple">Context-aware behavioural detection</p>
              <h1 className="mt-3 text-4xl leading-[1.1] font-semibold tracking-tight text-ink sm:text-5xl">
                A risk score you can show your work for.
              </h1>
              <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-grey">
                tellTale turns a flood of identity and access events into the small number of
                investigations actually worth an analyst&rsquo;s time — and for every one of
                them, the exact evidence and arithmetic behind the number, printed right beside
                it, not buried in a model nobody can open.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  href="/demo"
                  className="flex items-center gap-2 rounded-sm bg-purple px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-purple-dk"
                >
                  Try the demo
                  <ArrowRight className="size-4" />
                </Link>
                <Link
                  href="/demo/about"
                  className="flex items-center gap-2 rounded-sm border border-line px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-muted"
                >
                  Read the methodology
                </Link>
              </div>
              <p className="mt-4 text-xs text-grey">
                No signup. The interactive demo runs on synthetic data — nothing you touch is
                real.
              </p>
            </div>

            <div className="panel flex items-center justify-center p-8">
              <ScoreDiagram />
            </div>
          </div>
        </section>

        {/* ---- The descent, in real numbers from the demo --------------- */}
        <section className="border-y border-line bg-panel">
          <div className="mx-auto max-w-6xl px-6 py-12">
            <p className="label text-purple">The problem</p>
            <h2 className="mt-2 max-w-2xl text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              Most access anomalies are normal work wearing a scary label.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-grey">
              An on-call rotation, a scope-matched ticket, approved travel — context explains
              almost everything a naive detector flags. The numbers below are the exact descent
              rendered on the demo&rsquo;s own dashboard, reconciled by a script before every
              build:
            </p>

            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Descent value={RAISED_ANOMALIES.toLocaleString("en-US")} label="Raised anomalies" />
              <Descent
                value={SUPPRESSED_BY_CONTEXT.toLocaleString("en-US")}
                label="Suppressed by context"
              />
              <Descent value={String(ESCALATED_ANOMALIES)} label="Reached an analyst" />
              <Descent
                value={STAT_TILES.find((t) => t.label === "Confirmed findings")?.value ?? "3"}
                label="Confirmed findings"
              />
            </div>
            <p className="mt-4 text-xs text-grey">
              {INVESTIGATIONS} investigations opened this month, three confirmed. The queue sorts
              by expected cost — risk × asset criticality — so a 0.55 on production credentials
              can outrank an 0.80 on a marketing folder, on purpose.
            </p>
          </div>
        </section>

        {/* ---- How it works ---------------------------------------------- */}
        <section id="how-it-works" className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
          <p className="label text-purple">How it works</p>
          <h2 className="mt-2 max-w-xl text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            Four ideas do almost all of the work.
          </h2>

          <div className="mt-9 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {HOW_IT_WORKS.map((f) => (
              <div key={f.title} className="panel p-5">
                <f.icon className="size-4.5 text-purple" />
                <h3 className="mt-3 text-sm font-semibold text-ink">{f.title}</h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-grey">{f.body}</p>
              </div>
            ))}
          </div>

          <Link
            href="/demo/about"
            className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-purple hover:underline"
          >
            Read the full methodology
            <ArrowRight className="size-3.5" />
          </Link>
        </section>

        {/* ---- Two modules ------------------------------------------------ */}
        <section id="modules" className="border-t border-line bg-panel">
          <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
            <p className="label text-purple">Two modules, two identity spaces</p>
            <h2 className="mt-2 max-w-2xl text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              Behavioural risk and workforce reporting don&rsquo;t share a screen — on purpose.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-grey">
              Risk analysis is pseudonymous until a human decides otherwise, and that decision
              takes two approvals. Workforce reporting is named, because a working-time record
              nobody can attribute isn&rsquo;t a working-time record. Crossing between the two is
              an audited action, not a click.
            </p>

            <div className="mt-9 grid grid-cols-1 gap-5 lg:grid-cols-2">
              <ModuleCard
                icon={Shield}
                title="Risk"
                tagline="Pseudonymous, evidence-first"
                items={[
                  "Investigation queue, sorted by expected cost",
                  "Six-source connector health with a dead-man heartbeat",
                  "Suppression log — reversible, reopenable, audited",
                ]}
                href="/demo"
                cta="Explore the risk module"
              />
              <ModuleCard
                icon={Briefcase}
                title="Workforce"
                tagline="Named, operational, no risk score"
                items={[
                  "Org summary — working time and coverage by team",
                  "Application usage, by category, hour by hour",
                  "Screen capture gallery with tag, flag and search",
                ]}
                href="/demo/workforce"
                cta="Explore workforce reporting"
              />
            </div>
          </div>
        </section>

        {/* ---- Works with your stack --------------------------------------- */}
        <section className="mx-auto max-w-6xl px-6 py-14">
          <p className="label text-center text-grey">Reads from the sources you already run</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
            {CONNECTOR_LOGOS.map((name) => (
              <div key={name} className="flex items-center gap-2 text-grey">
                <BrandIcon name={name} className="size-4" />
                <span className="text-xs font-medium">{name}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ---- Honesty ------------------------------------------------------ */}
        <section className="border-t border-line">
          <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
            <div className="panel flex flex-col gap-6 p-7 sm:flex-row sm:items-center sm:justify-between">
              <div className="max-w-xl">
                <p className="label text-amber-700">Demo build — all data synthetic</p>
                <h2 className="mt-2 text-xl font-semibold tracking-tight text-ink">
                  What&rsquo;s real, and what&rsquo;s fixture.
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-grey">
                  The detection design and the statistics behind it are real. Every score,
                  contribution and timestamp the interactive demo shows is a literal written into
                  a fixture file, checked for internal consistency by a script before the build is
                  allowed to ship. No accuracy figure appears anywhere, because that evaluation
                  hasn&rsquo;t been run yet — stating one before it has would be the least
                  defensible thing on the screen.
                </p>
              </div>
              <Link
                href="/demo"
                className="flex shrink-0 items-center gap-2 self-start rounded-sm bg-purple px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-purple-dk sm:self-auto"
              >
                Try the demo now
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <div className="flex size-6 shrink-0 items-center justify-center rounded-sm border border-purple/30 bg-purple-lt text-purple">
              <LogoMark className="size-3.5" />
            </div>
            <span className="text-xs font-medium text-grey">
              tellTale — a demo console, not a production system
            </span>
          </div>
          <div className="flex items-center gap-5 text-xs text-grey">
            <Link href="/demo" className="hover:text-ink transition-colors">
              Demo
            </Link>
            <Link href="/demo/about" className="hover:text-ink transition-colors">
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
      <p className="mt-1 text-xs text-grey">{label}</p>
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
    <div className="panel flex flex-col p-6">
      <div className="flex items-center gap-2.5">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-sm border border-purple/30 bg-purple-lt text-purple">
          <Icon className="size-4" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-ink">{title}</h3>
          <p className="text-[11px] text-grey">{tagline}</p>
        </div>
      </div>
      <ul className="mt-4 space-y-2 text-[13px] leading-relaxed text-grey">
        {items.map((it) => (
          <li key={it} className="flex gap-2">
            <span className="mt-1.5 size-1 shrink-0 rounded-full bg-purple" />
            <span>{it}</span>
          </li>
        ))}
      </ul>
      <Link
        href={href}
        className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-purple hover:underline"
      >
        {cta}
        <ArrowRight className="size-3.5" />
      </Link>
    </div>
  );
}
