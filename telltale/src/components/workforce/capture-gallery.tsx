"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Flag, Tag } from "lucide-react";
import { cn } from "cn";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { BrandIcon } from "@/components/brand-icon";
import { CaptureThumb } from "@/components/workforce/capture-thumb";
import { ALL_MEMBERS, ALL_TEAMS, useFilters } from "@/lib/filters";
import { CAPTURES, MEMBERS } from "@/lib/fixtures";

/**
 * PRD §5.6: a paged gallery. Each thumbnail carries the member name, timestamp,
 * and tag and flag controls, with a `Flagged only` filter.
 *
 * Every frame is drawn from its committed seed (PRD §7.4) — there is no image
 * file anywhere in this repository, so it is not possible for a real screenshot
 * to reach the build by accident.
 */

const PAGE = 18;
const TAGS = ["Reviewed", "Needs context", "Escalate to HR", "Retain for case"];
const FLAG_REASONS = [
  { code: "POLICY_REVIEW", label: "Acceptable-use review" },
  { code: "DATA_HANDLING", label: "Data-handling concern" },
  { code: "CASE_EVIDENCE", label: "Attach to an open case" },
  { code: "MISCAPTURE", label: "Captured in error — delete" },
];

export function CaptureGallery() {
  const { team, member } = useFilters();
  const [flaggedOnly, setFlaggedOnly] = useState(false);
  const [mode, setMode] = useState<"all" | "scheduled" | "triggered">("all");
  const [page, setPage] = useState(0);
  const [tags, setTags] = useState<Record<string, string[]>>({});
  const [flags, setFlags] = useState<Record<string, string>>(
    Object.fromEntries(
      CAPTURES.filter((c) => c.flagged).map((c) => [c.id, "CASE_EVIDENCE"]),
    ),
  );

  const teamOf = useMemo(
    () => Object.fromEntries(MEMBERS.map((m) => [m.id, m.team])),
    [],
  );

  const filtered = CAPTURES.filter(
    (c) =>
      (team === ALL_TEAMS || teamOf[c.memberId] === team) &&
      (member === ALL_MEMBERS || c.memberName === member) &&
      (mode === "all" || c.mode === mode) &&
      (!flaggedOnly || flags[c.id] !== undefined),
  );

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE));
  const current = Math.min(page, pages - 1);
  const shown = filtered.slice(current * PAGE, current * PAGE + PAGE);

  const toggleTag = (id: string, tag: string) =>
    setTags((prev) => {
      const cur = prev[id] ?? [];
      return {
        ...prev,
        [id]: cur.includes(tag) ? cur.filter((t) => t !== tag) : [...cur, tag],
      };
    });

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 border-b border-line px-4 py-2.5 bg-slate-50">
        <span className="label mr-1 text-slate-500">Mode</span>
        {(["all", "scheduled", "triggered"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => {
              setMode(m);
              setPage(0);
            }}
            className={cn(
              "rounded-sm border px-2.5 py-1 text-xs font-medium capitalize transition-all",
              mode === m
                ? "border-emerald-600 bg-emerald-50 text-emerald-800 font-semibold "
                : "border-line bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900",
            )}
          >
            {m}
          </button>
        ))}

        <label className="ml-3 flex cursor-pointer items-center gap-1.5 rounded-sm border border-line bg-white px-2.5 py-1 text-xs text-slate-700 hover:bg-slate-100 transition-colors">
          <input
            type="checkbox"
            checked={flaggedOnly}
            onChange={(e) => {
              setFlaggedOnly(e.target.checked);
              setPage(0);
            }}
            className="size-3.5 rounded accent-emerald-600"
          />
          Flagged only
        </label>

        <div className="ml-auto flex items-center gap-2">
          <span className="machine text-xs text-slate-500">
            {filtered.length === 0
              ? "0"
              : `${current * PAGE + 1}–${current * PAGE + shown.length}`}{" "}
            of {filtered.length}
          </span>
          <button
            type="button"
            disabled={current === 0}
            onClick={() => setPage(current - 1)}
            className="rounded border border-line bg-white p-1 text-slate-500 disabled:opacity-30 enabled:hover:bg-slate-100 enabled:hover:text-slate-900 transition-colors"
          >
            <ChevronLeft className="size-3.5" />
          </button>
          <span className="machine text-xs text-slate-500">
            {current + 1} / {pages}
          </span>
          <button
            type="button"
            disabled={current >= pages - 1}
            onClick={() => setPage(current + 1)}
            className="rounded border border-line bg-white p-1 text-slate-500 disabled:opacity-30 enabled:hover:bg-slate-100 enabled:hover:text-slate-900 transition-colors"
          >
            <ChevronRight className="size-3.5" />
          </button>
        </div>
      </div>

      {shown.length === 0 ? (
        <p className="px-4 py-12 text-center text-sm text-slate-500">
          No capture matches these filters. Clear the mode chip or the
          flagged-only box.
        </p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3.5 p-4">
          {shown.map((c) => {
            const flag = flags[c.id];
            const itemTags = tags[c.id] ?? [];
            return (
              <figure
                key={c.id}
                className={cn(
                  "flex flex-col rounded-sm border p-2 bg-white transition-all hover:border-emerald-400 hover:",
                  flag ? "border-red-200 bg-red-50/20" : "border-line",
                )}
              >
                <CaptureThumb seed={c.seed} />
                <figcaption className="mt-2 px-0.5">
                  <p className="truncate text-xs font-semibold text-slate-900">
                    {c.memberName}
                  </p>
                  <p className="machine truncate text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5">
                    <span>{c.ts.slice(11, 16)}</span>
                    <span className="text-slate-300">·</span>
                    <BrandIcon name={c.application} className="size-3" />
                    <span className="truncate">{c.application}</span>
                  </p>
                  <div className="mt-1.5 flex items-center gap-1">
                    <span
                      className={cn(
                        "label rounded px-1.5 py-0.5 text-[10px] font-medium border",
                        c.mode === "triggered"
                          ? "border-amber-200 bg-amber-50 text-amber-800"
                          : "border-line bg-slate-100 text-slate-600",
                      )}
                    >
                      {c.mode}
                    </span>
                    {flag && (
                      <span className="label machine truncate rounded border border-red-200 bg-red-50 px-1.5 py-0.5 text-[10px] text-red-800">
                        {flag}
                      </span>
                    )}
                  </div>
                  {itemTags.length > 0 && (
                    <p className="mt-1.5 truncate text-[10px] text-emerald-700 font-medium">
                      {itemTags.join(" · ")}
                    </p>
                  )}

                  <div className="mt-2 flex gap-1.5">
                    <Popover>
                      <PopoverTrigger
                        render={
                          <button
                            type="button"
                            className={cn(
                              "flex flex-1 items-center justify-center gap-1 rounded border py-1 text-[10px] font-medium transition-colors",
                              itemTags.length
                                ? "border-emerald-300 bg-emerald-50 text-emerald-800 font-semibold"
                                : "border-line text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                            )}
                          />
                        }
                      >
                        <Tag className="size-2.5 text-emerald-600" />
                        Tag
                      </PopoverTrigger>
                      <PopoverContent
                        align="start"
                        className="w-48 rounded-sm p-1.5 shadow-lg bg-white border border-line text-slate-900 z-50"
                      >
                        {TAGS.map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => toggleTag(c.id, t)}
                            className="flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-xs text-slate-800 hover:bg-slate-100 transition-colors"
                          >
                            {t}
                            {itemTags.includes(t) && (
                              <span className="text-emerald-600 font-bold">
                                ✓
                              </span>
                            )}
                          </button>
                        ))}
                      </PopoverContent>
                    </Popover>

                    <Popover>
                      <PopoverTrigger
                        render={
                          <button
                            type="button"
                            className={cn(
                              "flex flex-1 items-center justify-center gap-1 rounded border py-1 text-[10px] font-medium transition-colors",
                              flag
                                ? "border-red-300 bg-red-50 text-red-800 font-semibold"
                                : "border-line text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                            )}
                          />
                        }
                      >
                        <Flag className="size-2.5 text-red-600" />
                        Flag
                      </PopoverTrigger>
                      <PopoverContent
                        align="start"
                        className="w-64 rounded-sm p-2 shadow-lg bg-white border border-line text-slate-900 z-50"
                      >
                        <p className="label px-2 py-1 text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                          Reason code
                        </p>
                        {FLAG_REASONS.map((r) => (
                          <button
                            key={r.code}
                            type="button"
                            onClick={() =>
                              setFlags((prev) => ({ ...prev, [c.id]: r.code }))
                            }
                            className="block w-full rounded px-2 py-1.5 text-left hover:bg-slate-100 transition-colors"
                          >
                            <span className="machine block text-xs font-semibold text-slate-900">
                              {r.code}
                            </span>
                            <span className="block text-[11px] text-slate-500">
                              {r.label}
                            </span>
                          </button>
                        ))}
                        {flag && (
                          <button
                            type="button"
                            onClick={() =>
                              setFlags((prev) => {
                                const next = { ...prev };
                                delete next[c.id];
                                return next;
                              })
                            }
                            className="mt-1 block w-full border-t border-line px-2 py-1.5 text-left text-xs text-red-600 hover:bg-red-50 rounded transition-colors"
                          >
                            Clear flag
                          </button>
                        )}
                      </PopoverContent>
                    </Popover>
                  </div>
                </figcaption>
              </figure>
            );
          })}
        </div>
      )}
    </div>
  );
}
