import { cn } from "cn";
import type { Contribution } from "@/lib/fixtures";

/**
 * PRD §5.3C: Feature · Evidence · Contribution to logit, one bar per row.
 * Red raises risk, green lowers it. The bars share one symmetric scale centred
 * on zero, so the context term reads as the counterweight it is rather than as
 * just another row.
 *
 * Nothing here is computed from the model — the logits are fixture literals and
 * scripts/verify-fixtures.mjs asserts that they sum to the printed total. The
 * one arithmetic this component does is adding up the column it is displaying,
 * which is exactly the sum a judge would do by hand.
 */
export function ContributionTable({
  contributions,
  logitTotal,
  probability,
  risk,
}: {
  contributions: Contribution[];
  logitTotal: number;
  probability: number;
  risk: number;
}) {
  const scale = Math.max(...contributions.map((c) => Math.abs(c.logit)), 1);
  const sum = contributions.reduce((a, c) => a + c.logit, 0);

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-line bg-slate-50/80">
            <th className="label px-4 py-2.5 text-left text-slate-500 text-[10px]">
              Feature
            </th>
            <th className="label px-4 py-2.5 text-left text-slate-500 text-[10px]">
              Evidence
            </th>
            <th className="label px-4 py-2.5 text-right text-slate-500 text-[10px]">
              Logit
            </th>
            <th className="label w-48 px-4 py-2.5 text-left text-slate-500 text-[10px]">
              Contribution
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {contributions.map((c) => {
            const zero = c.logit === 0;
            const raises = c.logit > 0;
            const intercept = c.feature.startsWith("Base rate");
            return (
              <tr
                key={c.feature}
                className={cn(
                  "hover:bg-slate-50/70 transition-colors",
                  zero && "text-slate-400",
                )}
              >
                <td className="px-4 py-2.5 align-top">
                  <span
                    className={cn(
                      "font-semibold",
                      zero ? "text-slate-400" : "text-slate-900",
                    )}
                  >
                    {c.feature}
                  </span>
                  {intercept && (
                    <span className="machine ml-1.5 text-[10px] text-slate-500">
                      β₀
                    </span>
                  )}
                </td>
                <td className="max-w-md px-4 py-2.5 align-top text-xs leading-relaxed text-slate-600">
                  <EvidenceText text={c.evidence} />
                </td>
                <td
                  className={cn(
                    "machine px-4 py-2.5 text-right align-top font-bold whitespace-nowrap",
                    zero
                      ? "text-slate-400"
                      : raises
                        ? "text-red-600"
                        : "text-emerald-700",
                  )}
                >
                  {zero
                    ? "0.00"
                    : `${raises ? "+" : "−"}${Math.abs(c.logit).toFixed(2)}`}
                </td>
                <td className="px-4 py-2.5 align-top">
                  <Bar logit={c.logit} scale={scale} />
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-emerald-500 bg-emerald-50/80">
            <td className="px-4 py-3 align-middle font-bold text-emerald-950">
              Σ contributions
            </td>
            <td className="machine px-4 py-3 align-middle text-xs text-slate-700">
              logit {fmt(logitTotal)} → σ(logit) = {probability.toFixed(2)} →
              risk {risk}
            </td>
            <td className="machine px-4 py-3 text-right align-middle font-bold text-emerald-950">
              {fmt(sum)}
            </td>
            <td className="px-4 py-3 align-middle">
              <span className="machine text-xs font-bold text-emerald-900">
                calibrated P(malicious) = {probability.toFixed(2)}
              </span>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

function fmt(v: number) {
  return `${v >= 0 ? "+" : "−"}${Math.abs(v).toFixed(2)}`;
}

function Bar({ logit, scale }: { logit: number; scale: number }) {
  const pct = (Math.abs(logit) / scale) * 50;
  const raises = logit > 0;
  return (
    <div className="relative h-4.5 w-full min-w-40 rounded border border-line bg-slate-100 overflow-hidden">
      <div className="absolute inset-y-0 left-1/2 w-px bg-slate-300" />
      {logit !== 0 && (
        <div
          className={cn(
            "bar-grow absolute inset-y-0.5 rounded-[2px]",
            raises ? "bg-red-500" : "bg-emerald-600",
          )}
          style={
            raises
              ? { left: "50%", width: `${pct}%`, transformOrigin: "left" }
              : { right: "50%", width: `${pct}%`, transformOrigin: "right" }
          }
        />
      )}
    </div>
  );
}

/**
 * Evidence strings are part prose, part machine output. Splitting on the
 * mathematical fragments keeps the PRD §8 typographic rule intact inside a
 * single sentence: the probability is mono, the sentence around it is not.
 */
const MACHINE_FRAGMENT =
  /((?:P\([^)]*\)|JSD|D|Z|robust Z|perplexity)\s*=\s*[+\-−]?[\d.]+|[A-Z][A-Z0-9_]{3,}(?:-\d+)?|\d+(?:\.\d+)?%|ASN \d+|[a-z-]+\.[a-z.-]+(?:\.[a-z-]+)*)/g;

function EvidenceText({ text }: { text: string }) {
  const parts = text.split(MACHINE_FRAGMENT);
  return (
    <>
      {parts.map((p, i) =>
        i % 2 === 1 ? (
          <span key={i} className="machine font-semibold text-slate-900">
            {p}
          </span>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  );
}
