"use client";

import { usePathname } from "next/navigation";
import { Calendar, X, Filter, Radio, ChevronDown } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DEMO_DATE, moduleForPath } from "@/lib/nav";
import { ALL_COHORTS, ALL_MEMBERS, ALL_SUBJECTS, ALL_TEAMS, useFilters } from "@/lib/filters";
import { COHORT_STATS, MEMBERS, QUEUE_ROWS } from "@/lib/fixtures";

const COHORTS = [ALL_COHORTS, ...COHORT_STATS.map((c) => c.cohort)];
const SUBJECTS = [ALL_SUBJECTS, ...QUEUE_ROWS.map((r) => r.pseudonym)];
const TEAMS = [ALL_TEAMS, ...Array.from(new Set(MEMBERS.map((m) => m.team)))];
const MEMBER_NAMES = [ALL_MEMBERS, ...MEMBERS.map((m) => m.name)];

/**
 * PRD §4: the universal filter triple on every page.
 *
 * The two select fields are module-aware. In the risk module they are cohort
 * and pseudonymous subject; in the workforce module they are team and named
 * member. That is not decoration — putting a subject pseudonym in the chrome of
 * a workforce screen would put the two identity spaces on one screen, which
 * §7.1 forbids.
 */
export function Topbar() {
  const pathname = usePathname();
  const mod = moduleForPath(pathname);
  const f = useFilters();

  const risk = mod === "risk";
  const options = risk
    ? ([
        { label: "Cohort", value: f.cohort, items: COHORTS, all: ALL_COHORTS, width: "w-52", key: "cohort" },
        { label: "Subject", value: f.subject, items: SUBJECTS, all: ALL_SUBJECTS, width: "w-36", key: "subject" },
      ] as const)
    : ([
        { label: "Team", value: f.team, items: TEAMS, all: ALL_TEAMS, width: "w-52", key: "team" },
        { label: "Member", value: f.member, items: MEMBER_NAMES, all: ALL_MEMBERS, width: "w-44", key: "member" },
      ] as const);

  const dirty = options.some((o) => o.value !== o.all);

  return (
    <header className="sticky top-0 z-20 flex h-13 shrink-0 items-center gap-3 border-b border-line bg-white/95 backdrop-blur px-6 text-slate-800 shadow-2xs">
      <div className="flex items-center gap-1.5 text-emerald-700 mr-1">
        <Filter className="size-3.5" />
        <span className="label text-[10px] font-bold text-emerald-700">Filters</span>
      </div>

      {options.map((o) => (
        <div key={o.key} className="flex items-center gap-1.5">
          <span className="label text-[10px] text-slate-500">{o.label}</span>
          <Select value={o.value} onValueChange={(v) => f.set({ [o.key]: String(v) })}>
            <SelectTrigger size="sm" className={`${o.width} h-8 rounded-md border-line bg-white text-xs text-slate-800 hover:border-emerald-600 transition-colors shadow-2xs`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-80 rounded-md border-line bg-white text-slate-800 shadow-lg z-50">
              {o.items.map((item) => (
                <SelectItem key={item} value={item} className={item.startsWith("#") ? "machine text-xs hover:bg-emerald-50 focus:bg-emerald-50" : "text-xs hover:bg-emerald-50 focus:bg-emerald-50"}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ))}

      <span className="label ml-1 text-[10px] text-slate-500">Date</span>
      <div
        title="Date range is pinned to the single synthetic day in this demo build"
        className="machine flex h-8 items-center gap-1.5 rounded-md border border-line bg-slate-50 px-2.5 text-xs text-slate-700 shadow-2xs"
      >
        <Calendar className="size-3.5 text-emerald-600" />
        <span>{DEMO_DATE}</span>
        <span className="text-slate-400">·</span>
        <span className="text-slate-500">00:00–23:59</span>
      </div>

      {dirty && (
        <button
          type="button"
          onClick={f.reset}
          className="label flex items-center gap-1 rounded-md border border-emerald-300 bg-emerald-50 px-2 py-1.5 text-[10px] font-semibold text-emerald-800 hover:bg-emerald-100 transition-colors shadow-2xs"
        >
          <X className="size-3" />
          Clear
        </button>
      )}

      {/* Right side live status indicators */}
      <div className="ml-auto flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1">
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-emerald-600" />
          </span>
          <span className="label text-[10px] text-emerald-800 font-bold tracking-wide">
            FEED ONLINE
          </span>
        </div>

        <div className="machine flex items-center gap-1 text-[11px] text-slate-500 bg-slate-50 px-2 py-1 rounded border border-line">
          <span>UTC</span>
        </div>
      </div>
    </header>
  );
}

