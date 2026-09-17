"use client";

import { Fragment, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Search,
  Filter,
  User,
  Server,
  Bot,
} from "lucide-react";
import { cn } from "cn";
import {
  IdentityGlyph,
  StatusChip,
  ValueBar,
  VerdictChip,
} from "@/components/risk/chips";
import { ALL_COHORTS, ALL_SUBJECTS, useFilters } from "@/lib/filters";
import {
  QUEUE_ROWS,
  TRIAGE_CAPACITY_AFTER_RANK,
  TRIAGE_CAPACITY_LABEL,
  routeIdFor,
} from "@/lib/fixtures";

const HEAD = [
  { label: "Rank", className: "w-14 text-right" },
  { label: "Subject", className: "w-32" },
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
  const [query, setQuery] = useState("");
  const [filterClass, setFilterClass] = useState<string>("all");

  const rows = QUEUE_ROWS.filter((r) => {
    if (cohort !== ALL_COHORTS && r.cohort !== cohort) return false;
    if (subject !== ALL_SUBJECTS && r.pseudonym !== subject) return false;
    if (filterClass !== "all" && r.identityClass !== filterClass) return false;
    if (query.trim()) {
      const q = query.toLowerCase();
      return (
        r.pseudonym.toLowerCase().includes(q) ||
        r.topSignal.toLowerCase().includes(q) ||
        r.cohort.toLowerCase().includes(q)
      );
    }
    return true;
  });

  /* The capacity rule sits before the first row that ranks below capacity */
  const ruleBefore = rows.findIndex((r) => r.rank > TRIAGE_CAPACITY_AFTER_RANK);

  return (
    <div>
      {/* Table search & quick filter toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-slate-50/70 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <div className="relative flex items-center">
            <Search className="absolute left-2.5 size-3.5 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter queue by #id, signal or cohort..."
              className="h-8 w-64 rounded-sm border border-line bg-white pl-8 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none transition-colors"
            />
          </div>
          {query && (
            <button
              onClick={() => setQuery("")}
              className="text-xs text-slate-500 hover:text-emerald-700"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <span className="label text-[10px] text-slate-500 mr-1 flex items-center gap-1">
            <Filter className="size-3 text-emerald-600" />
            Identity:
          </span>
          {[
            { id: "all", label: "All" },
            { id: "human", label: "Human", Icon: User },
            { id: "service", label: "Service", Icon: Server },
            { id: "agent", label: "Agent", Icon: Bot },
          ].map((tab) => {
            const active = filterClass === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterClass(tab.id)}
                className={cn(
                  "flex items-center gap-1 rounded px-2.5 py-1 text-[11px] font-medium transition-all",
                  active
                    ? "border border-emerald-300 bg-emerald-50 text-emerald-800 font-semibold"
                    : "border border-line bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50",
                )}
              >
                {tab.Icon && <tab.Icon className="size-3" />}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1080px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-line bg-slate-50/80">
              {HEAD.map((h, i) => (
                <th
                  key={i}
                  className={cn(
                    "label px-3 py-2.5 text-left align-bottom text-slate-500 text-[10px]",
                    h.className,
                  )}
                >
                  {h.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={HEAD.length}
                  className="px-3 py-10 text-center text-sm text-slate-500"
                >
                  No queued subject matches this query. Clear search or filters
                  to see all entries.
                </td>
              </tr>
            )}

            {rows.map((r, i) => {
              const below = r.rank > TRIAGE_CAPACITY_AFTER_RANK;
              const href = `/demo/subject/${routeIdFor(r.id)}`;
              return (
                <Fragment key={r.id}>
                  {i === ruleBefore && ruleBefore > 0 && (
                    <tr>
                      <td colSpan={HEAD.length} className="px-0 py-0">
                        <div className="flex items-center gap-3 border-y border-dashed border-amber-300 bg-amber-50/80 px-4 py-2">
                          <span className="label text-amber-800 font-bold tracking-wider">
                            {TRIAGE_CAPACITY_LABEL}
                          </span>
                          <span className="text-xs text-amber-900/80">
                            Everything below this line is retained and ranked —
                            it is simply not pretending to be actionable today.
                          </span>
                        </div>
                      </td>
                    </tr>
                  )}
                  <tr
                    onClick={() => router.push(href)}
                    className={cn(
                      "group cursor-pointer hover:bg-emerald-50/40 transition-colors",
                      below && "opacity-60",
                    )}
                  >
                    <td className="machine px-3 py-2.5 text-right text-slate-500 font-semibold">
                      {r.rank}
                    </td>
                    <td className="px-3 py-2.5">
                      <Link
                        href={href}
                        onClick={(e) => e.stopPropagation()}
                        className="machine inline-flex items-center gap-1.5 font-bold text-emerald-700 group-hover:text-emerald-900 group-hover:underline transition-colors"
                      >
                        <IdentityGlyph identityClass={r.identityClass} />
                        {r.pseudonym}
                      </Link>
                    </td>
                    <td className="px-3 py-2.5 text-slate-800">
                      {r.cohort}
                      <span className="machine ml-1.5 text-xs text-slate-400">
                        n={r.cohortSize}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <ValueBar value={r.risk} />
                    </td>
                    <td className="px-3 py-2.5">
                      <ValueBar
                        value={r.expectedCost}
                        display={`${r.expectedCost.toFixed(1)}`}
                        tone="purple"
                        className="min-w-28"
                      />
                      <p className="machine mt-0.5 text-[10px] text-slate-400">
                        {r.risk} × {r.assetCriticality.toFixed(2)}
                      </p>
                    </td>
                    <td className="px-3 py-2.5 text-slate-800">
                      <span
                        className={
                          r.topSignal.includes("=")
                            ? "machine text-xs font-mono font-semibold text-emerald-700"
                            : undefined
                        }
                      >
                        {r.topSignal}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <VerdictChip verdict={r.verdict} />
                    </td>
                    <td className="machine px-3 py-2.5 text-right text-xs whitespace-nowrap text-slate-500">
                      {r.age}
                    </td>
                    <td className="px-3 py-2.5">
                      <StatusChip status={r.status} />
                    </td>
                    <td className="px-3 py-2.5 text-slate-400 group-hover:text-emerald-700 group-hover:translate-x-0.5 transition-all">
                      <ArrowRight className="size-3.5" />
                    </td>
                  </tr>
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
