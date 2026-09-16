"use client";

import { usePathname } from "next/navigation";
import { Calendar, X } from "lucide-react";
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
    <header className="sticky top-0 z-20 flex h-12 shrink-0 items-center gap-2 border-b border-line bg-white px-6">
      {options.map((o) => (
        <div key={o.key} className="flex items-center gap-2">
          <span className="label text-grey">{o.label}</span>
          <Select value={o.value} onValueChange={(v) => f.set({ [o.key]: String(v) })}>
            <SelectTrigger size="sm" className={`${o.width} rounded-sm`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-80 rounded-sm shadow-none">
              {o.items.map((item) => (
                <SelectItem key={item} value={item} className={item.startsWith("#") ? "machine" : undefined}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ))}

      <span className="label ml-2 text-grey">Range</span>
      <div
        title="Date range is pinned to the single synthetic day in this demo build"
        className="machine flex h-7 items-center gap-1.5 rounded-sm border border-line bg-purple-lt/40 px-2 text-xs text-grey"
      >
        <Calendar className="size-3.5" />
        {DEMO_DATE} 00:00 → 23:59
      </div>

      {dirty && (
        <button
          type="button"
          onClick={f.reset}
          className="label flex items-center gap-1 rounded-sm border border-purple/30 bg-purple-lt px-1.5 py-1 text-purple hover:bg-purple/10"
        >
          <X className="size-3" />
          Clear
        </button>
      )}

      {/* The build badge lives in the sidebar (PRD §4) — one honesty signal,
          not two competing for the same attention. */}
      <span className="machine ml-auto text-xs text-grey">UTC</span>
    </header>
  );
}
