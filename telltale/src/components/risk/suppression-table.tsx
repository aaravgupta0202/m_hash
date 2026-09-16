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
      <div className="flex flex-wrap items-center gap-1.5 border-b border-line px-4 py-2.5">
        <span className="label mr-1 text-grey">Reason code</span>
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
            "ml-2 flex items-center gap-1.5 rounded-sm border px-2 py-1 text-xs",
            reason === REOPENED
              ? "border-red bg-red text-white"
              : "border-red/40 bg-red/5 text-red hover:bg-red/10",
          )}
        >
          Reopened
          <span className={cn("machine text-[10px]", reason === REOPENED ? "text-white/70" : "text-red/70")}>
            {ROWS.filter((s) => s.underReview).length}
          </span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[960px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-line">
              {["", "Time", "Subject", "Anomaly", "Suppressed by", "Reason code", "Reviewable"].map((h) => (
                <th key={h} className="label px-3 py-2 text-left text-grey">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((s) => {
              const expanded = open === s.id;
              return (
                <Fragment key={s.id}>
                  <tr
                    onClick={() => setOpen(expanded ? null : s.id)}
                    className={cn(
                      "cursor-pointer border-b border-line/70 hover:bg-purple-lt/50",
                      s.underReview && "border-l-2 border-l-red bg-red/4",
                      expanded && "bg-purple-lt/60",
                    )}
                  >
                    <td className="px-3 py-2 text-grey">
                      {expanded ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
                    </td>
                    <td className="machine px-3 py-2 text-xs text-grey">
                      {s.ts.slice(11, 19)}
                    </td>
                    <td className="machine px-3 py-2 font-medium text-purple">{s.subjectPseudonym}</td>
                    <td className="px-3 py-2 text-ink">{s.anomaly}</td>
                    <td className="px-3 py-2 text-grey">{s.suppressedBy}</td>
                    <td className="machine px-3 py-2 text-xs text-ink">{s.reasonCode}</td>
                    <td className="px-3 py-2">
                      {s.underReview ? (
                        <span className="label rounded-sm border border-red/40 bg-red/8 px-1.5 py-0.5 text-red">
                          Under review
                        </span>
                      ) : (
                        <span className="label text-green">Retained</span>
                      )}
                    </td>
                  </tr>

                  {expanded && (
                    <tr className={cn("border-b border-line", s.underReview ? "bg-red/3" : "bg-purple-lt/30")}>
                      <td />
                      <td colSpan={6} className="px-3 pt-1 pb-3">
                        <p className="label mb-2 text-grey">Context record examined</p>
                        <dl className="machine grid grid-cols-4 gap-x-6 gap-y-1.5 text-xs">
                          <Pair k="record_id" v={s.record.recordId} />
                          <Pair
                            k="created_by"
                            v={s.record.createdBy}
                            tone={s.underReview ? "text-red" : undefined}
                          />
                          <Pair k="created_at" v={s.record.createdAt.replace("T", " ").replace("Z", "")} />
                          <Pair k="scope" v={s.record.scope} />
                        </dl>

                        {s.underReview && (
                          <div className="mt-3 rounded-sm border border-red/40 bg-white px-3 py-2.5">
                            <p className="text-sm leading-relaxed text-ink">
                              This suppression rested on a record the subject created and assigned to
                              themselves. The manufactured-context detector fired on the record itself, the
                              suppression was reopened, and the anomaly was re-scored with the context term
                              inverted from a discount to a penalty.
                            </p>
                            {s.linkedSubjectId && (
                              <Link
                                href={`/subject/${routeIdFor(s.linkedSubjectId)}`}
                                className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-red hover:underline"
                              >
                                Open the investigation this reopened →
                              </Link>
                            )}
                          </div>
                        )}

                        {!s.underReview && (
                          <p className="mt-2.5 max-w-3xl text-xs leading-relaxed text-grey">
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
        "flex items-center gap-1.5 rounded-sm border px-2 py-1 text-xs",
        active
          ? "border-purple bg-purple text-white"
          : "border-line text-grey hover:bg-purple-lt hover:text-purple",
      )}
    >
      {children}
      <span className={cn("machine text-[10px]", active ? "text-white/70" : "text-grey/70")}>{count}</span>
    </button>
  );
}

function Pair({ k, v, tone }: { k: string; v: string; tone?: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-[10px] text-grey/80">{k}</dt>
      <dd className={cn("truncate", tone ?? "text-ink")}>{v}</dd>
    </div>
  );
}
