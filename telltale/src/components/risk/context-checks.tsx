import { AlertTriangle, Check, X, ShieldCheck } from "lucide-react";
import { cn } from "cn";
import type { CheckResult, ContextCheck, ContextVerdict } from "@/lib/fixtures";

/**
 * PRD §5.3D: the four tests, in the order the engine applies them. Each row
 * shows the record that was examined, not just a verdict — a check that cannot
 * name its evidence is an assertion, and this screen exists to avoid making
 * assertions.
 */
const TESTS: { key: ContextCheck["test"]; label: string; question: string }[] = [
  { key: "precedence", label: "Precedence", question: "Did the record exist before the activity?" },
  { key: "provenance", label: "Provenance", question: "Was it created by someone other than the subject?" },
  { key: "scope", label: "Scope match", question: "Does its scope resolve to the resources touched?" },
  { key: "proportionality", label: "Proportionality", question: "Is the volume plausible for that scope?" },
];

const RESULT: Record<CheckResult, { label: string; Icon: typeof Check; className: string; dot: string }> = {
  pass: { label: "PASS", Icon: Check, className: "text-emerald-700", dot: "bg-emerald-600" },
  warn: { label: "WARN", Icon: AlertTriangle, className: "text-amber-700", dot: "bg-amber-600" },
  fail: { label: "FAIL", Icon: X, className: "text-red-700", dot: "bg-red-600" },
};

const VERDICT_LINE: Record<ContextVerdict, string> = {
  authorised: "All four tests pass. The activity is authorised work and the anomaly is suppressed, with the record retained.",
  partial: "Some tests pass and some do not. The context term is applied at partial weight rather than in full.",
  absent: "No context record was found in any source, so there is nothing to test. Absence is not evidence of intent — it removes the discount, it does not add a penalty.",
  suspicious: "A record exists and fails provenance. The attempt to manufacture authorisation is itself the signal, and it raises the score rather than lowering it.",
};

export function ContextChecks({ checks, verdict }: { checks: ContextCheck[]; verdict: ContextVerdict }) {
  return (
    <div>
      <ul className="divide-y divide-line">
        {TESTS.map((t) => {
          const check = checks.find((c) => c.test === t.key);
          if (!check) return null;
          const r = RESULT[check.result];
          const punchline = check.test === "provenance" && check.result === "fail" && check.createdBy;
          return (
            <li
              key={t.key}
              className={cn(
                "flex gap-4 border-l-3 px-4 py-3.5 transition-colors",
                check.result === "fail"
                  ? "border-l-red-500 bg-red-50/50"
                  : check.result === "warn"
                    ? "border-l-amber-500 bg-amber-50/50"
                    : "border-l-emerald-600 bg-emerald-50/30",
              )}
            >
              <div className="flex w-38 shrink-0 items-start gap-2.5">
                <div
                  className={cn(
                    "mt-0.5 flex size-5 items-center justify-center rounded-full border",
                    check.result === "fail"
                      ? "border-red-200 bg-red-100"
                      : check.result === "warn"
                        ? "border-amber-200 bg-amber-100"
                        : "border-emerald-200 bg-emerald-100",
                  )}
                >
                  <r.Icon className={cn("size-3", r.className)} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900">{t.label}</p>
                  <p className={cn("label text-[10px] font-bold", r.className)}>{r.label}</p>
                </div>
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs text-slate-500">{t.question}</p>
                <p
                  className={cn(
                    "mt-1 text-sm leading-relaxed",
                    punchline ? "font-bold text-red-700" : "text-slate-800",
                  )}
                >
                  {check.finding}
                </p>
                {(check.recordId || check.createdBy || check.createdAt) && (
                  <dl className="machine mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-600">
                    {check.recordId && <Pair k="record" v={check.recordId} />}
                    {check.createdBy && <Pair k="created_by" v={check.createdBy} highlight={!!punchline} />}
                    {check.createdAt && <Pair k="created_at" v={check.createdAt} />}
                  </dl>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <div className="border-t border-line bg-slate-50/70 px-4 py-3 text-xs leading-relaxed text-slate-700 flex items-center gap-2">
        <ShieldCheck className="size-4 text-emerald-600 shrink-0" />
        <span>{VERDICT_LINE[verdict]}</span>
      </div>
    </div>
  );
}

function Pair({ k, v, highlight }: { k: string; v: string; highlight?: boolean }) {
  return (
    <div className="flex gap-1.5 items-center">
      <dt className="text-slate-400 text-[11px]">{k}:</dt>
      <dd className={cn("text-[11px]", highlight ? "font-bold text-red-700 bg-red-100 px-1.5 py-0.5 rounded border border-red-200" : "text-emerald-800 font-semibold")}>{v}</dd>
    </div>
  );
}

