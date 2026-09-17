import Link from "next/link";
import { Check, ArrowRight, Shield, Cpu, Monitor, Bot, Briefcase, Lock } from "lucide-react";

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
      "Order-2 Markov trajectory sequence scoring",
      "4-test context verification engine",
      "Plain-English investigation dossiers",
      "Ranked Review Alerts priority queue",
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
    description: "Managed corporate devices. Adds endpoint Sensor and the full workforce module.",
    features: [
      "All Cloud tier capabilities",
      "User-space Sensor (Windows, Mac, Linux)",
      "Presence divergence detection",
      "Application composition drift",
      "Full workforce module: Team Overview & App Usage",
      "Active vs idle timelines and team reports",
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
      "Scheduled (5-min) and triggered screen capture",
      "Encrypted evidence vault with dual-custody access",
      "Honeytoken deception orchestration",
      "Action path graph and containment webhooks",
      "Jurisdiction profiles (India DPDP, EU GDPR, Works agreement)",
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

        {/* 4 Tiers Grid */}
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

        {/* Two Budgets, One Agent: Business Strategy Showcase (Master Doc §4.10 & §4.4) */}
        <div className="mt-10 rounded-xl border border-line bg-white p-6 sm:p-8 shadow-xs">
          <div className="max-w-3xl">
            <span className="label text-emerald-700">Business Strategy</span>
            <h3 className="mt-1 text-xl font-bold tracking-tight text-ink">
              Two Budgets, One Agent: The Indian Mid-Market Incumbent Displacement
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-600">
              Workforce analytics incumbents (ActivTrak, Hubstaff, EmployEye) charge ₹5,000–₹10,000 per user per year for activity reporting alone with zero detection engine. tellTale’s Sensor tier is priced at incumbent parity (₹7,000/yr), letting buyers fund enterprise threat detection out of an existing, approved operational budget.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-emerald-200 bg-emerald-50/40 p-5">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                <Lock className="size-4 text-emerald-700" />
                CISO / SecOps Lead
              </div>
              <p className="mt-1 text-xs font-semibold text-slate-700">Owns Identity Threat & Insider Risk Budget</p>
              <ul className="mt-3 space-y-1.5 text-xs text-slate-600">
                <li>• Gets session-theft detection and credential-misuse alerts.</li>
                <li>• Receives an evidence-backed mathematical dossier per finding.</li>
                <li>• Operates on pseudonymous subjects (#4912), never productivity scores.</li>
              </ul>
            </div>

            <div className="rounded-lg border border-blue-200 bg-blue-50/40 p-5">
              <div className="flex items-center gap-2 text-blue-900 font-bold text-xs">
                <Briefcase className="size-4 text-blue-700" />
                HR / Operations Lead
              </div>
              <p className="mt-1 text-xs font-semibold text-slate-700">Owns Workforce Analytics & Attendance Budget</p>
              <ul className="mt-3 space-y-1.5 text-xs text-slate-600">
                <li>• Gets Team Overview, App Usage, attendance, and capture trail.</li>
                <li>• Gains operational team visibility and tool allocation metrics.</li>
                <li>• Sees named employees, never a security risk score.</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-line pt-5">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                The 15-Minute Retrospective Audit
              </h4>
              <p className="mt-0.5 text-xs text-slate-600">
                Connect Okta and GitHub read-only via OAuth. We replay 90 days of existing audit logs to deliver day-two findings: departing employees whose access shifted, dormant credentials, and how many alerts our context gate suppresses.
              </p>
            </div>
            <Link
              href="/demo"
              className="shrink-0 inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition-colors shadow-xs"
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
