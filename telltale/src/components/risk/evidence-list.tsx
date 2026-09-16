"use client";

import { useState } from "react";
import { Flag, Tag } from "lucide-react";
import { cn } from "cn";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { EvidenceItem } from "@/lib/fixtures";

/**
 * PRD §5.3G: collected artefacts with tag and flag affordances. Flagging opens
 * a reason-code picker. State is React state only and resets on reload — that
 * is expected and stated on the panel, because a demo that pretends to persist
 * is a demo that has to explain itself when it does not.
 *
 * Note what is *not* here: no message bodies, no file contents, no typed text
 * (PRD §7.5). Every row is metadata — a timestamp, an action, a resource, a
 * source. That constraint is the product's position on proportionality, so the
 * evidence list is the screen where it has to be visibly true.
 */

const TAGS = ["Pivotal", "Corroborating", "Needs legal review", "Chain of custody", "Exculpatory"];

const REASON_CODES = [
  { code: "EXFIL_CANDIDATE", label: "Candidate exfiltration artefact" },
  { code: "CONTEXT_FORGED", label: "Context record appears manufactured" },
  { code: "CREDENTIAL_MISUSE", label: "Credential or session misuse" },
  { code: "POLICY_BREACH", label: "Acceptable-use or policy breach" },
  { code: "FALSE_POSITIVE", label: "False positive — authorised work" },
];

const KIND_TONE: Record<string, string> = {
  Action: "border-purple/30 bg-purple-lt text-purple",
  Identity: "border-line bg-white text-grey",
  "Context record": "border-amber/40 bg-amber/5 text-amber",
  Presence: "border-line bg-white text-grey",
  Employment: "border-line bg-white text-grey",
  Capture: "border-red/40 bg-red/5 text-red",
  "Suppression record": "border-green/40 bg-green/5 text-green",
  Baseline: "border-line bg-white text-grey",
};

export function EvidenceList({ items }: { items: EvidenceItem[] }) {
  const [tags, setTags] = useState<Record<string, string[]>>({});
  const [flags, setFlags] = useState<Record<string, string>>({});

  const toggleTag = (id: string, tag: string) =>
    setTags((prev) => {
      const current = prev[id] ?? [];
      return { ...prev, [id]: current.includes(tag) ? current.filter((t) => t !== tag) : [...current, tag] };
    });

  const flaggedCount = Object.keys(flags).length;
  const taggedCount = Object.values(tags).filter((t) => t.length > 0).length;

  return (
    <div>
      <div className="flex items-center justify-between gap-4 border-b border-line px-4 py-2">
        <p className="machine text-xs text-grey">
          {items.length} artefacts · {flaggedCount} flagged · {taggedCount} tagged
        </p>
        <p className="text-[11px] text-grey">Tags and flags are session state in this build and reset on reload.</p>
      </div>

      <ul className="divide-y divide-line">
        {items.map((item) => {
          const flag = flags[item.id];
          const itemTags = tags[item.id] ?? [];
          return (
            <li
              key={item.id}
              className={cn(
                "flex items-start gap-4 border-l-2 px-4 py-2.5",
                flag ? "border-l-red bg-red/3" : "border-l-transparent",
              )}
            >
              <span className="machine w-40 shrink-0 text-xs text-grey">
                {item.ts.replace("T", " ").replace("Z", "")}
              </span>

              <span
                className={cn(
                  "label w-36 shrink-0 truncate rounded-sm border px-1.5 py-0.5 text-center whitespace-nowrap",
                  KIND_TONE[item.kind] ?? "border-line bg-white text-grey",
                )}
              >
                {item.kind}
              </span>

              <div className="min-w-0 flex-1">
                <p className="machine text-xs leading-relaxed text-ink">{item.detail}</p>
                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] text-grey">source · {item.source}</span>
                  {itemTags.map((t) => (
                    <span key={t} className="label rounded-sm border border-purple/30 bg-purple-lt px-1.5 py-0.5 text-purple">
                      {t}
                    </span>
                  ))}
                  {flag && (
                    <span className="label machine rounded-sm border border-red/40 bg-red/8 px-1.5 py-0.5 text-red">
                      {flag}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-1">
                <Popover>
                  <PopoverTrigger
                    render={
                      <button
                        type="button"
                        className={cn(
                          "flex items-center gap-1 rounded-sm border px-1.5 py-1 text-[11px]",
                          itemTags.length
                            ? "border-purple/30 bg-purple-lt text-purple"
                            : "border-line text-grey hover:bg-purple-lt hover:text-purple",
                        )}
                      />
                    }
                  >
                    <Tag className="size-3" />
                    Tag
                  </PopoverTrigger>
                  <PopoverContent align="end" className="w-56 rounded-sm p-1 shadow-none">
                    {TAGS.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => toggleTag(item.id, t)}
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
                          "flex items-center gap-1 rounded-sm border px-1.5 py-1 text-[11px]",
                          flag ? "border-red/40 bg-red/8 text-red" : "border-line text-grey hover:bg-purple-lt hover:text-purple",
                        )}
                      />
                    }
                  >
                    <Flag className="size-3" />
                    Flag
                  </PopoverTrigger>
                  <PopoverContent align="end" className="w-72 rounded-sm p-1 shadow-none">
                    <p className="label px-2 py-1.5 text-grey">Reason code</p>
                    {REASON_CODES.map((r) => (
                      <button
                        key={r.code}
                        type="button"
                        onClick={() => setFlags((prev) => ({ ...prev, [item.id]: r.code }))}
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
                            delete next[item.id];
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
            </li>
          );
        })}
      </ul>
    </div>
  );
}
