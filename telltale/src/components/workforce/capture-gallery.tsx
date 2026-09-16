"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Flag, Tag } from "lucide-react";
import { cn } from "cn";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
    Object.fromEntries(CAPTURES.filter((c) => c.flagged).map((c) => [c.id, "CASE_EVIDENCE"])),
  );

  const teamOf = useMemo(() => Object.fromEntries(MEMBERS.map((m) => [m.id, m.team])), []);

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
      return { ...prev, [id]: cur.includes(tag) ? cur.filter((t) => t !== tag) : [...cur, tag] };
    });

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 border-b border-line px-4 py-2.5">
        <span className="label mr-1 text-grey">Mode</span>
        {(["all", "scheduled", "triggered"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => {
              setMode(m);
              setPage(0);
            }}
            className={cn(
              "rounded-sm border px-2 py-1 text-xs capitalize",
              mode === m ? "border-purple bg-purple text-white" : "border-line text-grey hover:bg-purple-lt hover:text-purple",
            )}
          >
            {m}
          </button>
        ))}

        <label className="ml-3 flex cursor-pointer items-center gap-1.5 rounded-sm border border-line px-2 py-1 text-xs text-grey hover:bg-purple-lt">
          <input
            type="checkbox"
            checked={flaggedOnly}
            onChange={(e) => {
              setFlaggedOnly(e.target.checked);
              setPage(0);
            }}
            className="size-3 accent-[var(--tt-purple)]"
          />
          Flagged only
        </label>

        <div className="ml-auto flex items-center gap-2">
          <span className="machine text-xs text-grey">
            {filtered.length === 0 ? "0" : `${current * PAGE + 1}–${current * PAGE + shown.length}`} of{" "}
            {filtered.length}
          </span>
          <button
            type="button"
            disabled={current === 0}
            onClick={() => setPage(current - 1)}
            className="rounded-sm border border-line p-1 text-grey disabled:opacity-40 enabled:hover:bg-purple-lt enabled:hover:text-purple"
          >
            <ChevronLeft className="size-3.5" />
          </button>
          <span className="machine text-xs text-grey">
            {current + 1} / {pages}
          </span>
          <button
            type="button"
            disabled={current >= pages - 1}
            onClick={() => setPage(current + 1)}
            className="rounded-sm border border-line p-1 text-grey disabled:opacity-40 enabled:hover:bg-purple-lt enabled:hover:text-purple"
          >
            <ChevronRight className="size-3.5" />
          </button>
        </div>
      </div>

      {shown.length === 0 ? (
        <p className="px-4 py-10 text-center text-sm text-grey">
          No capture matches these filters. Clear the mode chip or the flagged-only box.
        </p>
      ) : (
        <div className="grid grid-cols-6 gap-3 p-4">
          {shown.map((c) => {
            const flag = flags[c.id];
            const itemTags = tags[c.id] ?? [];
            return (
              <figure
                key={c.id}
                className={cn("flex flex-col rounded-sm border p-1.5", flag ? "border-red/50 bg-red/4" : "border-line")}
              >
                <CaptureThumb seed={c.seed} />
                <figcaption className="mt-1.5 px-0.5">
                  <p className="truncate text-xs font-medium text-ink">{c.memberName}</p>
                  <p className="machine truncate text-[11px] text-grey">
                    {c.ts.slice(11, 16)} · {c.application}
                  </p>
                  <div className="mt-1 flex items-center gap-1">
                    <span
                      className={cn(
                        "label rounded-sm border px-1 py-0.5",
                        c.mode === "triggered"
                          ? "border-amber/40 bg-amber/8 text-amber"
                          : "border-line bg-white text-grey",
                      )}
                    >
                      {c.mode}
                    </span>
                    {flag && (
                      <span className="label machine truncate rounded-sm border border-red/40 bg-red/8 px-1 py-0.5 text-red">
                        {flag}
                      </span>
                    )}
                  </div>
                  {itemTags.length > 0 && (
                    <p className="mt-1 truncate text-[10px] text-purple">{itemTags.join(" · ")}</p>
                  )}

                  <div className="mt-1.5 flex gap-1">
                    <Popover>
                      <PopoverTrigger
                        render={
                          <button
                            type="button"
                            className={cn(
                              "flex flex-1 items-center justify-center gap-1 rounded-sm border py-1 text-[10px]",
                              itemTags.length
                                ? "border-purple/30 bg-purple-lt text-purple"
                                : "border-line text-grey hover:bg-purple-lt hover:text-purple",
                            )}
                          />
                        }
                      >
                        <Tag className="size-2.5" />
                        Tag
                      </PopoverTrigger>
                      <PopoverContent align="start" className="w-48 rounded-sm p-1 shadow-none">
                        {TAGS.map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => toggleTag(c.id, t)}
                            className="flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-left text-xs text-ink hover:bg-purple-lt"
                          >
                            {t}
                            {itemTags.includes(t) && <span className="text-purple">✓</span>}
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
                              "flex flex-1 items-center justify-center gap-1 rounded-sm border py-1 text-[10px]",
                              flag
                                ? "border-red/40 bg-red/8 text-red"
                                : "border-line text-grey hover:bg-purple-lt hover:text-purple",
                            )}
                          />
                        }
                      >
                        <Flag className="size-2.5" />
                        Flag
                      </PopoverTrigger>
                      <PopoverContent align="start" className="w-64 rounded-sm p-1 shadow-none">
                        <p className="label px-2 py-1.5 text-grey">Reason code</p>
                        {FLAG_REASONS.map((r) => (
                          <button
                            key={r.code}
                            type="button"
                            onClick={() => setFlags((prev) => ({ ...prev, [c.id]: r.code }))}
                            className="block w-full rounded-sm px-2 py-1.5 text-left hover:bg-purple-lt"
                          >
                            <span className="machine block text-xs text-ink">{r.code}</span>
                            <span className="block text-[11px] text-grey">{r.label}</span>
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
                            className="mt-1 block w-full border-t border-line px-2 py-1.5 text-left text-xs text-grey hover:bg-purple-lt"
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
