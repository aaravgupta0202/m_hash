import Link from "next/link";
import { Check, ArrowRight, Shield, Cpu, Monitor, Bot } from "lucide-react";

const TIERS = [
  {
    name: "Cloud",
    price: "₹3,000",
    period: "/ identity / yr (₹250/mo)",
    icon: Shield,
    badge: "Agentless Landing",
    description: "General business users. Fast 15-minute deployment with zero endpoint installation.",
    features: [
      "Identity & SaaS audit telemetry",
      "Robust volumetric baselines (Median / MAD)",
      "Markov trajectory sequence scoring",
      "4-test context verification engine",
      "Plain-English investigation dossiers",
      "Ranked priority alert queue",
    ],
    cta: "Start with Cloud",
    popular: false,
  },
  {
    name: "Sensor",
    price: "₹7,000",
    period: "/ identity / yr (₹580/mo)",
    icon: Monitor,
    badge: "Most Popular",
    description: "Managed corporate devices. Adds endpoint activity & the complete workforce module.",
    features: [
      "All Cloud tier capabilities",
      "User-space Sensor (Windows, Mac, Linux)",
      "Presence divergence detection",
      "Application composition drift",
      "Full workforce module: app & web usage",
      "Active vs idle timelines & team reports",
    ],
    cta: "Deploy Sensor",
    popular: true,
  },
  {
    name: "Sensor + Capture",
    price: "₹11,000",
    period: "/ identity / yr (₹920/mo)",
    icon: Cpu,
    badge: "High-Privilege & Regulated",
    description: "Engineers, DevOps, administrators, executives, and high-compliance teams.",
    features: [
      "All Sensor tier capabilities",
      "Scheduled & triggered screen capture",
      "Jurisdiction profile policy gating",
      "Honeytoken deception orchestration",
      "Communication graph topology analysis",
      "Automated containment action webhooks",
    ],
    cta: "Explore Capture",
    popular: false,
  },
  {
    name: "Non-Human Identity",
    price: "₹5,000",
    period: "/ identity / yr (₹420/mo)",
    icon: Bot,
    badge: "Autonomous Agents",
    description: "Service accounts, CI/CD tokens, API keys, and autonomous AI agents.",
    features: [
      "Same core trajectory scoring engine",
      "Autonomous AI agent behavioral profiling",
      "Tool-call & lateral API sequence tracking",
      "Zero endpoint agent footprint",
      "Prompt injection & token misuse detection",
      "Unified priority ranking alongside humans",
    ],
    cta: "Protect Non-Human",
    popular: false,
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="border-t border-line bg-slate-50/60 py-16 sm:py-20">
      <div className="mx-auto w-full max-w-[1600px] px-6 sm:px-10 lg:px-16">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 shadow-xs mb-3">
            <span className="size-1.5 rounded-full bg-emerald-600" />
            Built for India & DPDP Act 2023 Compliance
          </div>
          <p className="label text-emerald-700">Predictable Economics in Rupees</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            Priced in ₹ per monitored identity, never per gigabyte.
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            Ingest-volume pricing penalizes visibility: teams turn off logs to stay under budget. tellTale charges per identity annually in INR. Adding another data source, connected SaaS tool, or audit trail is always free.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {TIERS.map((tier) => (
            <div
              key={tier.name}
              className={`panel relative flex flex-col justify-between p-6 bg-white border ${
                tier.popular
                  ? "border-emerald-500 shadow-md ring-1 ring-emerald-500"
                  : "border-line shadow-xs"
              } rounded-lg`}
            >
              {tier.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-emerald-600 px-3 py-0.5 text-[11px] font-bold text-white uppercase tracking-wider shadow-xs">
                  {tier.badge}
                </span>
              )}

              <div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-900">{tier.name}</span>
                  <div className="flex size-7 items-center justify-center rounded-md bg-emerald-50 text-emerald-700">
                    <tier.icon className="size-4" />
                  </div>
                </div>

                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-3xl font-bold tracking-tight text-slate-900">{tier.price}</span>
                  <span className="text-xs text-slate-500">{tier.period}</span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-slate-600 min-h-[36px]">
                  {tier.description}
                </p>

                <ul className="mt-6 space-y-2.5 border-t border-line pt-4 text-xs text-slate-700">
                  {tier.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2">
                      <Check className="size-3.5 shrink-0 text-emerald-600 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8 pt-4 border-t border-line">
                <Link
                  href="/demo"
                  className={`flex w-full items-center justify-center gap-1.5 rounded-md px-4 py-2 text-xs font-semibold transition-colors ${
                    tier.popular
                      ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs"
                      : "border border-line bg-white text-slate-800 hover:bg-slate-50"
                  }`}
                >
                  <span>{tier.cta}</span>
                  <ArrowRight className="size-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-lg border border-line bg-white p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                The 15-Minute Retrospective Audit for Indian Mid-Market
              </h4>
              <p className="mt-1 text-xs text-slate-600">
                Connect Okta and GitHub read-only via OAuth. We replay your past 90 days of retained audit logs to produce day-two findings: departing employees whose access patterns shifted, dormant credentials, and how many alerts our context gate would have suppressed.
              </p>
            </div>
            <Link
              href="/demo"
              className="shrink-0 inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition-colors border border-emerald-200"
            >
              <span>Explore Demo Findings</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
