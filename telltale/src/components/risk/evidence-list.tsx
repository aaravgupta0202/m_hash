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
  Action: "border-emerald-200 bg-emerald-50 text-emerald-800",
  Identity: "border-slate-200 bg-slate-100 text-slate-700",
  "Context record": "border-amber-200 bg-amber-50 text-amber-800",
  Presence: "border-slate-200 bg-slate-100 text-slate-700",
  Employment: "border-slate-200 bg-slate-100 text-slate-700",
  Capture: "border-red-200 bg-red-50 text-red-800",
  "Suppression record": "border-emerald-200 bg-emerald-50 text-emerald-800",
  Baseline: "border-slate-200 bg-slate-100 text-slate-700",
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
      <div className="flex items-center justify-between gap-4 border-b border-line px-4 py-2 bg-slate-50/50">
        <p className="machine text-xs text-slate-500">
          {items.length} artefacts · {flaggedCount} flagged · {taggedCount} tagged
        </p>
        <p className="text-[11px] text-slate-400">Tags and flags are session state in this build and reset on reload.</p>
      </div>

      <ul className="divide-y divide-line">
        {items.map((item) => {
          const flag = flags[item.id];
          const itemTags = tags[item.id] ?? [];
          return (
            <li
              key={item.id}
              className={cn(
                "flex items-start gap-4 border-l-2 px-4 py-2.5 transition-colors",
                flag ? "border-l-red-500 bg-red-50/30" : "border-l-transparent hover:bg-slate-50/50",
              )}
            >
              <span className="machine w-40 shrink-0 text-xs text-slate-500">
                {item.ts.replace("T", " ").replace("Z", "")}
              </span>

              <span
                className={cn(
                  "label w-36 shrink-0 truncate rounded border px-1.5 py-0.5 text-center whitespace-nowrap text-[10px] font-semibold",
                  KIND_TONE[item.kind] ?? "border-slate-200 bg-slate-100 text-slate-700",
                )}
              >
                {item.kind}
              </span>

              <div className="min-w-0 flex-1">
                <p className="machine text-xs leading-relaxed text-slate-800">{item.detail}</p>
                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] text-slate-400">source · {item.source}</span>
                  {itemTags.map((t) => (
                    <span key={t} className="label rounded border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-800">
                      {t}
                    </span>
                  ))}
                  {flag && (
                    <span className="label machine rounded border border-red-200 bg-red-50 px-1.5 py-0.5 text-[10px] font-bold text-red-800">
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
                          "flex items-center gap-1 rounded border px-2 py-1 text-[11px] font-medium transition-colors shadow-2xs",
                          itemTags.length
                            ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                            : "border-line bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                        )}
                      />
                    }
                  >
                    <Tag className="size-3 text-emerald-600" />
                    Tag
                  </PopoverTrigger>
                  <PopoverContent align="end" className="w-56 rounded-lg p-1 shadow-lg bg-white border border-line text-slate-800 z-50">
                    {TAGS.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => toggleTag(item.id, t)}
                        className="flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-xs text-slate-700 hover:bg-slate-100"
                      >
                        {t}
                        {itemTags.includes(t) && <span className="text-emerald-600 font-bold">✓</span>}
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
                          "flex items-center gap-1 rounded border px-2 py-1 text-[11px] font-medium transition-colors shadow-2xs",
                          flag ? "border-red-300 bg-red-50 text-red-800" : "border-line bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                        )}
                      />
                    }
                  >
                    <Flag className="size-3 text-red-600" />
                    Flag
                  </PopoverTrigger>
                  <PopoverContent align="end" className="w-72 rounded-lg p-2 shadow-lg bg-white border border-line text-slate-800 z-50">
                    <p className="label px-2 py-1 text-[10px] text-slate-400 font-bold uppercase tracking-wider">Reason code</p>
                    {REASON_CODES.map((r) => (
                      <button
                        key={r.code}
                        type="button"
                        onClick={() => setFlags((prev) => ({ ...prev, [item.id]: r.code }))}
                        className="block w-full rounded px-2 py-1.5 text-left hover:bg-slate-50"
                      >
                        <span className="machine block text-xs font-bold text-slate-900">{r.code}</span>
                        <span className="block text-[11px] text-slate-500">{r.label}</span>
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
                        className="mt-1 block w-full border-t border-line px-2 py-1.5 text-left text-xs text-red-600 hover:bg-red-50 rounded"
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
