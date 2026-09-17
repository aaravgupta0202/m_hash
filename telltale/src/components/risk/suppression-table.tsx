"use client";

import { Fragment, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "cn";
import { SUPPRESSIONS, SUPPRESSION_REASON_LABELS, routeIdFor } from "@/lib/fixtures";

/**
 * PRD §5.5: filterable log, ~40 rows, filter chips by reason code, every row
 * expands to the exact context record that caused the suppression — including
 * who created it and when.
 *
 * The UNDER REVIEW row is the one that matters. It is a suppression later found
 * to rest on manufactured context, and it links to #2071. That link is what
 * turns the suppression claim from a convenience into an auditable one: the
 * mechanism that hid an anomaly is the same mechanism that surfaced it again.
 */

const ALL = "ALL";
const REOPENED = "REOPENED";

/* A log reads newest first. The reopened row is marked and expanded by default,
   and has its own chip, so sorting by time does not bury the one row the whole
   argument turns on. */
const ROWS = [...SUPPRESSIONS].sort((a, b) => b.ts.localeCompare(a.ts));

export function SuppressionTable() {
  const [reason, setReason] = useState(ALL);
  const [open, setOpen] = useState<string | null>("sup-rev");

  const counts = useMemo(() => {
    const out: Record<string, number> = {};
    for (const s of ROWS) out[s.reasonCode] = (out[s.reasonCode] ?? 0) + 1;
    return out;
  }, []);

  const rows =
    reason === ALL
      ? ROWS
      : reason === REOPENED
        ? ROWS.filter((s) => s.underReview)
        : ROWS.filter((s) => s.reasonCode === reason);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-1.5 border-b border-line bg-slate-50/70 px-4 py-2.5">
        <span className="label mr-1 text-slate-500 text-[10px]">Reason code</span>
        <Chip active={reason === ALL} onClick={() => setReason(ALL)} count={ROWS.length}>
          All
        </Chip>
        {Object.entries(SUPPRESSION_REASON_LABELS).map(([code, label]) => (
          <Chip key={code} active={reason === code} onClick={() => setReason(code)} count={counts[code] ?? 0}>
            {label}
          </Chip>
        ))}
        <button
          type="button"
          onClick={() => setReason(REOPENED)}
          className={cn(
            "ml-2 flex items-center gap-1.5 rounded border px-2.5 py-1 text-xs font-semibold transition-all shadow-2xs",
            reason === REOPENED
              ? "border-red-300 bg-red-100 text-red-900 font-bold"
              : "border-red-200 bg-red-50 text-red-700 hover:bg-red-100/70",
          )}
        >
          Reopened
          <span className={cn("machine text-[10px] px-1.5 py-0.2 rounded font-bold", reason === REOPENED ? "bg-red-200 text-red-900" : "bg-red-100 text-red-700")}>
            {ROWS.filter((s) => s.underReview).length}
          </span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[960px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-line bg-slate-50/80">
              {["", "Time", "Subject", "Anomaly", "Suppressed by", "Reason code", "Reviewable"].map((h) => (
                <th key={h} className="label px-3 py-2.5 text-left text-slate-500 text-[10px]">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((s) => {
              const expanded = open === s.id;
              return (
                <Fragment key={s.id}>
                  <tr
                    onClick={() => setOpen(expanded ? null : s.id)}
                    className={cn(
                      "cursor-pointer hover:bg-emerald-50/40 transition-colors",
                      s.underReview && "border-l-3 border-l-red-500 bg-red-50/40",
                      expanded && "bg-slate-50/60",
                    )}
                  >
                    <td className="px-3 py-2.5 text-slate-400">
                      {expanded ? <ChevronDown className="size-3.5 text-emerald-700" /> : <ChevronRight className="size-3.5 text-slate-400" />}
                    </td>
                    <td className="machine px-3 py-2.5 text-xs text-slate-500">
                      {s.ts.slice(11, 19)}
                    </td>
                    <td className="machine px-3 py-2.5 font-bold text-emerald-700">{s.subjectPseudonym}</td>
                    <td className="px-3 py-2.5 text-slate-800">{s.anomaly}</td>
                    <td className="px-3 py-2.5 text-slate-600">{s.suppressedBy}</td>
                    <td className="machine px-3 py-2.5 text-xs text-slate-600">{s.reasonCode}</td>
                    <td className="px-3 py-2.5">
                      {s.underReview ? (
                        <span className="label rounded border border-red-200 bg-red-50 px-2 py-0.5 text-red-800 font-bold">
                          Under review
                        </span>
                      ) : (
                        <span className="label text-emerald-700 font-semibold">Retained</span>
                      )}
                    </td>
                  </tr>

                  {expanded && (
                    <tr className={cn("border-b border-line", s.underReview ? "bg-red-50/30" : "bg-slate-50/60")}>
                      <td />
                      <td colSpan={6} className="px-3 pt-2 pb-4">
                        <p className="label mb-2 text-slate-500 text-[10px] font-bold">Context record examined</p>
                        <dl className="machine grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-1.5 text-xs">
                          <Pair k="record_id" v={s.record.recordId} />
                          <Pair
                            k="created_by"
                            v={s.record.createdBy}
                            tone={s.underReview ? "text-red-700 font-bold" : undefined}
                          />
                          <Pair k="created_at" v={s.record.createdAt.replace("T", " ").replace("Z", "")} />
                          <Pair k="scope" v={s.record.scope} />
                        </dl>

                        {s.underReview && (
                          <div className="mt-3 rounded-lg border border-red-200 bg-white px-4 py-3 shadow-xs">
                            <p className="text-xs leading-relaxed text-slate-800">
                              This suppression rested on a record the subject created and assigned to
                              themselves. The manufactured-context detector fired on the record itself, the
                              suppression was reopened, and the anomaly was re-scored with the context term
                              inverted from a discount to a penalty.
                            </p>
                            {s.linkedSubjectId && (
                              <Link
                                href={`/subject/${routeIdFor(s.linkedSubjectId)}`}
                                className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-semibold text-red-700 hover:text-red-900 hover:underline"
                              >
                                Open the investigation this reopened →
                              </Link>
                            )}
                          </div>
                        )}

                        {!s.underReview && (
                          <p className="mt-2.5 max-w-3xl text-xs leading-relaxed text-slate-600">
                            The anomaly was real and the explanation was checked. The record was created by an
                            identity other than the subject, before the activity, with a scope that resolves
                            to the resources touched. Nothing was deleted — this row is queryable and the
                            suppression is reversible.
                          </p>
                        )}
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Chip({
  active,
  count,
  onClick,
  children,
}: {
  active: boolean;
  count: number;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 rounded border px-2.5 py-1 text-xs transition-all shadow-2xs",
        active
          ? "border-emerald-300 bg-emerald-50 font-semibold text-emerald-800"
          : "border-line bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900",
      )}
    >
      <span>{children}</span>
      <span className={cn("machine text-[10px] font-semibold", active ? "text-emerald-700" : "text-slate-400")}>{count}</span>
    </button>
  );
}

function Pair({ k, v, tone }: { k: string; v: string; tone?: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-[10px] text-slate-500">{k}</dt>
      <dd className={cn("truncate text-xs text-slate-800", tone)}>{v}</dd>
    </div>
  );
}

