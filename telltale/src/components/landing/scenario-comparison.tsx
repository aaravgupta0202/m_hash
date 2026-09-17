import Link from "next/link";
import { ArrowRight, CheckCircle2, AlertTriangle, ShieldAlert } from "lucide-react";

export function ScenarioComparison() {
  return (
    <section id="scenarios" className="border-t border-line bg-white">
      <div className="mx-auto w-full max-w-[1600px] px-6 py-16 sm:px-10 sm:py-20 lg:px-16">
        <div className="max-w-3xl">
          <p className="label text-emerald-700">The Ultimate Test</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            Three users. One identical command.
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            To see why context changes everything, observe what happens when three engineers execute the exact same action:{" "}
            <code className="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs text-emerald-800 font-semibold border border-line">
              git clone git@github.com:corp/payments-core.git
            </code>
            . Legacy tools treat all three identically. tellTale evaluates the trajectory, the timing, and whether your systems actually asked for it.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Priya: Legitimate */}
          <div className="panel flex flex-col justify-between border border-emerald-200 bg-emerald-50/30 p-6 rounded-lg shadow-xs">
            <div>
              <div className="flex items-center justify-between gap-2 border-b border-emerald-200/60 pb-4">
                <div>
                  <span className="text-xs font-bold text-emerald-700 uppercase tracking-wide">Priya</span>
                  <h3 className="text-base font-semibold text-ink">Normal Development</h3>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800">
                  <CheckCircle2 className="size-3.5 text-emerald-600" />
                  14 / 100
                </span>
              </div>

              <dl className="mt-4 space-y-3 text-xs">
                <div>
                  <dt className="font-semibold text-slate-700">Action sequence</dt>
                  <dd className="mt-0.5 text-slate-600 leading-relaxed font-mono text-[11px]">
                    Corporate VPN → SSO → repo clone → new branch → pull request
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-700">Sequence probability</dt>
                  <dd className="mt-0.5 text-slate-600">Common developer path (modal workflow)</dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-700">Context verification</dt>
                  <dd className="mt-0.5 text-slate-600">
                    Jira ticket assigned by team lead 24h prior, explicitly scoping payments-core
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-700">Cohort drift</dt>
                  <dd className="mt-0.5 text-slate-600">Tracking peers closely (0% abnormal drift)</dd>
                </div>
                <div className="rounded-md bg-white p-3 border border-emerald-200/70 text-slate-700">
                  <span className="font-semibold text-emerald-800">tellTale Verdict: </span>
                  Suppressed automatically. Never rings an alarm or wastes analyst time.
                </div>
                <div className="text-[11px] text-slate-500 italic">
                  Legacy tool verdict: Severity 1 false positive (~45 min wasted triage).
                </div>
              </dl>
            </div>

            <Link
              href="/demo/subject/8830"
              className="mt-6 flex items-center justify-between rounded border border-emerald-300 bg-white px-3.5 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-50 transition-colors shadow-2xs"
            >
              <span>View live case dossier</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>

          {/* Marcus: Compromised */}
          <div className="panel flex flex-col justify-between border border-red-200 bg-red-50/30 p-6 rounded-lg shadow-xs">
            <div>
              <div className="flex items-center justify-between gap-2 border-b border-red-200/60 pb-4">
                <div>
                  <span className="text-xs font-bold text-red-700 uppercase tracking-wide">Marcus</span>
                  <h3 className="text-base font-semibold text-ink">Session Theft & Exfiltration</h3>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-xs font-bold text-red-800">
                  <ShieldAlert className="size-3.5 text-red-600" />
                  93 / 100
                </span>
              </div>

              <dl className="mt-4 space-y-3 text-xs">
                <div>
                  <dt className="font-semibold text-slate-700">Action sequence</dt>
                  <dd className="mt-0.5 text-slate-600 leading-relaxed font-mono text-[11px]">
                    Commercial VPN (Zurich) → clone → tar archive → upload to external S3
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-700">Sequence probability</dt>
                  <dd className="mt-0.5 text-slate-600 font-mono text-[11px]">
                    P(external upload | archive) = 0.0004
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-700">Context verification</dt>
                  <dd className="mt-0.5 text-slate-600">
                    Zero authorising tickets; resignation submitted 4 days ago
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-700">Cohort drift</dt>
                  <dd className="mt-0.5 text-slate-600">Sharp break from anchor (+12 on archive volume)</dd>
                </div>
                <div className="rounded-md bg-white p-3 border border-red-200/70 text-slate-700">
                  <span className="font-semibold text-red-800">tellTale Verdict: </span>
                  Critical priority. Top of queue with full mathematical evidence chain.
                </div>
                <div className="text-[11px] text-slate-500 italic">
                  Legacy tool verdict: 3 disconnected alerts in 3 consoles, none conclusive.
                </div>
              </dl>
            </div>

            <Link
              href="/demo/subject/4912"
              className="mt-6 flex items-center justify-between rounded border border-red-300 bg-white px-3.5 py-2 text-xs font-semibold text-red-800 hover:bg-red-50 transition-colors shadow-2xs"
            >
              <span>View live case dossier</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>

          {/* Dana: Manufactured Context */}
          <div className="panel flex flex-col justify-between border border-amber-200 bg-amber-50/30 p-6 rounded-lg shadow-xs">
            <div>
              <div className="flex items-center justify-between gap-2 border-b border-amber-200/60 pb-4">
                <div>
                  <span className="text-xs font-bold text-amber-700 uppercase tracking-wide">Dana</span>
                  <h3 className="text-base font-semibold text-ink">Manufactured Context Attack</h3>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-900">
                  <AlertTriangle className="size-3.5 text-amber-600" />
                  78 / 100
                </span>
              </div>

              <dl className="mt-4 space-y-3 text-xs">
                <div>
                  <dt className="font-semibold text-slate-700">Action sequence</dt>
                  <dd className="mt-0.5 text-slate-600 leading-relaxed font-mono text-[11px]">
                    Corporate net → creates ticket → self-assigns → clone → cloud sync
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-700">Sequence probability</dt>
                  <dd className="mt-0.5 text-slate-600">Self-assign to novel codebase sequence is rare</dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-700">Context verification</dt>
                  <dd className="mt-0.5 text-slate-600">
                    Provenance test fails: self-assigned ticket without historical contribution
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-700">Cohort drift</dt>
                  <dd className="mt-0.5 text-slate-600">Gradual 6-week slow burn (+260% divergence)</dd>
                </div>
                <div className="rounded-md bg-white p-3 border border-amber-200/70 text-slate-700">
                  <span className="font-semibold text-amber-900">tellTale Verdict: </span>
                  Caught by manufactured context detector. Gating suppression withdrawn.
                </div>
                <div className="text-[11px] text-slate-500 italic">
                  Legacy tool verdict: Silent (ticket present, volume within threshold).
                </div>
              </dl>
            </div>

            <Link
              href="/demo/subject/2071"
              className="mt-6 flex items-center justify-between rounded border border-amber-300 bg-white px-3.5 py-2 text-xs font-semibold text-amber-900 hover:bg-amber-50 transition-colors shadow-2xs"
            >
              <span>View live case dossier</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
