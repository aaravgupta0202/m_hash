"use client";

import { Fragment } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { cn } from "cn";
import { IdentityGlyph, StatusChip, ValueBar, VerdictChip } from "@/components/risk/chips";
import { ALL_COHORTS, ALL_SUBJECTS, useFilters } from "@/lib/filters";
import { QUEUE_ROWS, TRIAGE_CAPACITY_AFTER_RANK, TRIAGE_CAPACITY_LABEL, routeIdFor } from "@/lib/fixtures";

const HEAD = [
  { label: "Rank", className: "w-14 text-right" },
  { label: "Subject", className: "w-28" },
  { label: "Cohort", className: "w-44" },
  { label: "Risk", className: "w-28" },
  { label: "Expected cost", className: "w-32" },
  { label: "Top signal", className: "min-w-64" },
  { label: "Context", className: "w-32" },
  { label: "Age", className: "w-24 text-right" },
  { label: "Status", className: "w-28" },
  { label: "", className: "w-8" },
];

export function QueueTable() {
  const router = useRouter();
  const { cohort, subject } = useFilters();

  const rows = QUEUE_ROWS.filter(
    (r) => (cohort === ALL_COHORTS || r.cohort === cohort) && (subject === ALL_SUBJECTS || r.pseudonym === subject),
  );

  /* The capacity rule sits before the first row that ranks below capacity, so
     it stays truthful under a filter instead of being drawn at a fixed index. */
  const ruleBefore = rows.findIndex((r) => r.rank > TRIAGE_CAPACITY_AFTER_RANK);

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1080px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-line">
            {HEAD.map((h, i) => (
              <th key={i} className={cn("label px-3 py-2 text-left align-bottom text-grey", h.className)}>
                {h.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={HEAD.length} className="px-3 py-8 text-center text-sm text-grey">
                No queued subject matches this filter. Clear it from the top bar.
              </td>
            </tr>
          )}

          {rows.map((r, i) => {
            const below = r.rank > TRIAGE_CAPACITY_AFTER_RANK;
            const href = `/subject/${routeIdFor(r.id)}`;
            return (
              <Fragment key={r.id}>
                {i === ruleBefore && ruleBefore > 0 && (
                  <tr>
                    <td colSpan={HEAD.length} className="px-0 py-0">
                      <div className="flex items-center gap-3 border-y border-dashed border-amber/50 bg-amber/5 px-3 py-1.5">
                        <span className="label text-amber">{TRIAGE_CAPACITY_LABEL}</span>
                        <span className="text-xs text-grey">
                          Everything below this line is retained and ranked — it is simply not pretending to be
                          actionable today.
                        </span>
                      </div>
                    </td>
                  </tr>
                )}
                <tr
                  onClick={() => router.push(href)}
                  className={cn(
                    "cursor-pointer border-b border-line/70 hover:bg-purple-lt/50",
                    below && "opacity-60",
                  )}
                >
                  <td className="machine px-3 py-2 text-right text-grey">{r.rank}</td>
                  <td className="px-3 py-2">
                    <Link
                      href={href}
                      onClick={(e) => e.stopPropagation()}
                      className="machine inline-flex items-center gap-1.5 font-medium text-purple hover:underline"
                    >
                      <IdentityGlyph identityClass={r.identityClass} />
                      {r.pseudonym}
                    </Link>
                  </td>
                  <td className="px-3 py-2 text-ink">
                    {r.cohort}
                    <span className="machine ml-1.5 text-xs text-grey">n={r.cohortSize}</span>
                  </td>
                  <td className="px-3 py-2">
                    <ValueBar value={r.risk} />
                  </td>
                  <td className="px-3 py-2">
                    <ValueBar
                      value={r.expectedCost}
                      display={`${r.expectedCost.toFixed(1)}`}
                      tone="purple"
                      className="min-w-28"
                    />
                    <p className="machine mt-0.5 text-[10px] text-grey">
                      {r.risk} × {r.assetCriticality.toFixed(2)}
                    </p>
                  </td>
                  <td className="px-3 py-2 text-ink">
                    <span className={r.topSignal.includes("=") ? "machine text-xs" : undefined}>{r.topSignal}</span>
                  </td>
                  <td className="px-3 py-2">
                    <VerdictChip verdict={r.verdict} />
                  </td>
                  <td className="machine px-3 py-2 text-right text-xs whitespace-nowrap text-grey">{r.age}</td>
                  <td className="px-3 py-2">
                    <StatusChip status={r.status} />
                  </td>
                  <td className="px-3 py-2 text-grey">
                    <ArrowRight className="size-3.5" />
                  </td>
                </tr>
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
