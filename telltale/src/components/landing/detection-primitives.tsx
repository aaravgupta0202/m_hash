import {
  Activity,
  GitBranch,
  TrendingUp,
  Share2,
  Laptop,
  PieChart,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  Clock,
  UserCheck,
  Target,
  Scale,
} from "lucide-react";

const PRIMITIVES = [
  {
    icon: Activity,
    name: "Volumetric deviation",
    math: "Median & MAD",
    desc: "Catches sudden bulk actions: mass download, mass export, bulk permission changes. Robust against outlier spikes.",
  },
  {
    icon: GitBranch,
    name: "Trajectory surprisal",
    math: "Order-2 Markov with backoff",
    desc: "Living-off-the-land attacks where individual steps are authorized, but the sequence of actions betrays intent.",
  },
  {
    icon: TrendingUp,
    name: "Cohort divergence",
    math: "Anchored peer-relative CUSUM",
    desc: "Slow burn attacks over weeks. Scored against a frozen historical baseline so an attacker cannot train the system.",
  },
  {
    icon: Share2,
    name: "Graph topology change",
    math: "Metadata edge analysis",
    desc: "Sudden external-domain communication, cross-department edges, or pre-departure collusion without reading content.",
  },
  {
    icon: Laptop,
    name: "Presence divergence",
    math: "Cloud vs Endpoint delta",
    desc: "Cloud API calls or repository clones occurring while the physical endpoint is locked, idle, or offline.",
  },
  {
    icon: PieChart,
    name: "Composition drift",
    math: "Jensen–Shannon divergence",
    desc: "Sustained changes in work category mix, such as an engineer whose day quietly shifts to file archiving and uploads.",
  },
  {
    icon: KeyRound,
    name: "Honeytoken triggers",
    math: "Deterministic deception",
    desc: "Seeded decoy credentials and documents. Touching a decoy carries zero false positives and needs no baseline.",
  },
];

const CONTEXT_TESTS = [
  {
    icon: Clock,
    name: "Precedence",
    rule: "Created ≥ 30m prior",
    defeats: "Retroactive justification (filing a ticket after an exfiltration to launder it).",
  },
  {
    icon: UserCheck,
    name: "Provenance",
    rule: "Assigned by another team member",
    defeats: "The insider who creates and self-assigns their own authorization.",
  },
  {
    icon: Target,
    name: "Scope Match",
    rule: "Names specific resource touched",
    defeats: "Using an unrelated open ticket as blanket cover for any unauthorized action.",
  },
  {
    icon: Scale,
    name: "Proportionality",
    rule: "Volume plausible for work class",
    defeats: "Using a small approved mandate as cover for cloning forty repositories.",
  },
];

export function DetectionPrimitives() {
  return (
    <section id="detection-core" className="border-t border-line bg-white py-16 sm:py-20">
      <div className="mx-auto w-full max-w-[1600px] px-6 sm:px-10 lg:px-16">
        <div className="max-w-3xl">
          <p className="label text-emerald-700">Detection Architecture</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            Seven independent primitives. Zero black boxes.
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            tellTale combines seven independent mathematical detectors. An evader who defeats one is caught by the others. Each detector outputs an additive log-odds term so the explanation equals the model.
          </p>
        </div>

        {/* 7 Primitives Grid */}
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PRIMITIVES.map((p, idx) => (
            <div
              key={p.name}
              className={`panel p-5 bg-white border border-line rounded-lg shadow-xs flex flex-col justify-between ${
                idx === 6 ? "sm:col-span-2 lg:col-span-1" : ""
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex size-7 items-center justify-center rounded-md bg-emerald-50 text-emerald-700">
                    <p.icon className="size-4" />
                  </div>
                  <span className="font-mono text-[10px] text-slate-400 font-semibold">{p.math}</span>
                </div>
                <h3 className="mt-3 text-sm font-semibold text-slate-900">{p.name}</h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* 4-Test Context Verification Box */}
        <div className="mt-12 rounded-xl border border-emerald-200 bg-emerald-50/40 p-6 sm:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-emerald-200/70 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-5 text-emerald-700" />
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                  Adversarial Context Verification
                </span>
              </div>
              <h3 className="mt-1 text-xl font-bold tracking-tight text-ink">
                Context is an attack surface: 4 tests prevent evasion
              </h3>
            </div>
            <div className="rounded bg-white px-3 py-1.5 border border-emerald-300 text-xs font-semibold text-emerald-900 shadow-2xs">
              + Manufactured-context detector built in
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {CONTEXT_TESTS.map((t) => (
              <div key={t.name} className="rounded-lg border border-emerald-200/80 bg-white p-4 shadow-2xs">
                <div className="flex items-center gap-2">
                  <t.icon className="size-4 text-emerald-700" />
                  <span className="text-xs font-bold text-slate-900">{t.name}</span>
                </div>
                <div className="mt-2 text-[11px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded inline-block">
                  {t.rule}
                </div>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">
                  <span className="font-semibold text-slate-800">Defeats: </span>
                  {t.defeats}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
