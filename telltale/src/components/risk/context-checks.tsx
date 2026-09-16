import { AlertTriangle, Check, X } from "lucide-react";
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
  pass: { label: "PASS", Icon: Check, className: "text-green", dot: "bg-green" },
  warn: { label: "WARN", Icon: AlertTriangle, className: "text-amber", dot: "bg-amber" },
  fail: { label: "FAIL", Icon: X, className: "text-red", dot: "bg-red" },
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
                "flex gap-4 border-l-2 px-4 py-3",
                check.result === "fail" ? "border-l-red bg-red/3" : check.result === "warn" ? "border-l-amber bg-amber/3" : "border-l-green",
              )}
            >
              <div className="flex w-36 shrink-0 items-start gap-2">
                <r.Icon className={cn("mt-0.5 size-4 shrink-0", r.className)} />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink">{t.label}</p>
                  <p className={cn("label", r.className)}>{r.label}</p>
                </div>
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs text-grey">{t.question}</p>
                <p
                  className={cn(
                    "mt-1 text-sm leading-relaxed",
                    punchline ? "font-medium text-red" : "text-ink",
                  )}
                >
                  {check.finding}
                </p>
                {(check.recordId || check.createdBy || check.createdAt) && (
                  <dl className="machine mt-1.5 flex flex-wrap gap-x-5 gap-y-1 text-xs text-grey">
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

      <p className="border-t border-line bg-purple-lt/40 px-4 py-2.5 text-xs leading-relaxed text-grey">
        {VERDICT_LINE[verdict]}
      </p>
    </div>
  );
}

function Pair({ k, v, highlight }: { k: string; v: string; highlight?: boolean }) {
  return (
    <div className="flex gap-1.5">
      <dt className="text-grey/70">{k}</dt>
      <dd className={highlight ? "font-medium text-red" : "text-ink"}>{v}</dd>
    </div>
  );
}
