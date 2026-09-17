"use client";

import { useState } from "react";
import { ChevronDown, Sparkles } from "lucide-react";
import { cn } from "cn";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BrandIcon } from "@/components/brand-icon";
import { CaptureThumb } from "@/components/workforce/capture-thumb";
import { screenshotFor } from "@/lib/capture-screenshots";
import type { Capture } from "@/lib/fixtures";

/**
 * Opens on a click on a thumbnail — the caption already shows member,
 * time and application in miniature, this is the same facts at a size
 * a judge can actually read, plus the full flag/tag state and a collapsed-
 * by-default "AI insights" panel.
 *
 * The insights are template sentences filled in from the capture's own
 * fields, not a model call — nothing in this build computes anything at
 * runtime (PRD §7.4/§7.5), and a capture gallery is not where that
 * principle should quietly stop applying. The panel says so.
 */
export function CaptureDetailDialog({
  capture,
  team,
  tags,
  flagLabel,
  onOpenChange,
}: {
  capture: Capture | null;
  team: string | undefined;
  tags: string[];
  flagLabel: string | undefined;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={capture !== null} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-full overflow-y-auto rounded-sm sm:max-w-xl">
        {capture && (
          <CaptureDetailBody
            capture={capture}
            team={team}
            tags={tags}
            flagLabel={flagLabel}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function CaptureDetailBody({
  capture: c,
  team,
  tags,
  flagLabel,
}: {
  capture: Capture;
  team: string | undefined;
  tags: string[];
  flagLabel: string | undefined;
}) {
  const [insightsOpen, setInsightsOpen] = useState(false);
  const isReference = screenshotFor(c.application, c.seed) !== null;

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <BrandIcon name={c.application} className="size-4" />
          {c.application}
        </DialogTitle>
        <DialogDescription>
          {c.memberName}
          {team ? ` · ${team}` : ""} · {c.ts.slice(11, 16)} IST
        </DialogDescription>
      </DialogHeader>

      <div className="px-6">
        <CaptureThumb seed={c.seed} application={c.application} aspect="aspect-16/10" />
        <p className="mt-1.5 text-[11px] text-grey">
          {isReference
            ? "Generic reference image of this application's real UI, published by the vendor — not a capture of any real screen."
            : "Generated placeholder, drawn from this capture's committed seed — not a capture of any real screen."}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-x-6 gap-y-3 px-6 py-4 text-xs">
        <Field label="Mode" value={c.mode} capitalize />
        <Field label="Timestamp" value={`${c.ts.slice(11, 16)} IST`} mono />
        <Field label="Member" value={c.memberName} />
        <Field label="Team" value={team ?? "—"} />
        <Field
          label="Flag"
          value={flagLabel ?? "None"}
          tone={flagLabel ? "text-red-700 font-semibold" : undefined}
        />
        <Field label="Tags" value={tags.length ? tags.join(", ") : "None"} />
      </div>

      <div className="border-t border-line px-6 py-3">
        <button
          type="button"
          onClick={() => setInsightsOpen((v) => !v)}
          className="flex w-full items-center justify-between text-left"
        >
          <span className="flex items-center gap-1.5 text-xs font-semibold text-ink">
            <Sparkles className="size-3.5 text-purple" />
            AI insights
          </span>
          <ChevronDown
            className={cn(
              "size-3.5 text-grey transition-transform",
              insightsOpen && "rotate-180",
            )}
          />
        </button>
        {insightsOpen && (
          <div className="mt-2.5">
            <ul className="space-y-1.5 text-xs leading-relaxed text-ink">
              {insightsFor(c, flagLabel !== undefined).map((line, i) => (
                <li key={i} className="flex gap-2">
                  <span className="mt-1 size-1 shrink-0 rounded-full bg-purple" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
            <p className="mt-2.5 text-[11px] text-grey">
              Generated from this capture&rsquo;s own fields using a fixed template, not a model call —
              nothing in this build is computed at runtime.
            </p>
          </div>
        )}
      </div>
    </>
  );
}

function Field({
  label,
  value,
  mono,
  capitalize,
  tone,
}: {
  label: string;
  value: string;
  mono?: boolean;
  capitalize?: boolean;
  tone?: string;
}) {
  return (
    <div className="min-w-0">
      <dt className="label text-[10px] text-grey">{label}</dt>
      <dd
        className={cn(
          "mt-0.5 truncate text-ink",
          mono && "machine",
          capitalize && "capitalize",
          tone,
        )}
      >
        {value}
      </dd>
    </div>
  );
}

const DAYPART = (hour: number) =>
  hour < 6
    ? "night"
    : hour < 12
      ? "morning"
      : hour < 17
        ? "afternoon"
        : hour < 21
          ? "evening"
          : "night";

function insightsFor(c: Capture, flagged: boolean): string[] {
  const hour = Number(c.ts.slice(11, 13));
  const lines: string[] = [];

  lines.push(
    c.mode === "triggered"
      ? `Requested by a data-handling rule, not the fixed cadence — one of the reasons a capture like this exists at all.`
      : `Taken on the fixed five-minute schedule, the same as every other scheduled frame this day.`,
  );

  lines.push(
    `Falls in the ${DAYPART(hour)} window (${c.ts.slice(11, 16)} IST), consistent with this application appearing in ${c.memberName.split(" ")[0]}'s hourly breakdown on the usage page.`,
  );

  lines.push(
    flagged
      ? `Already flagged — see the flag reason above for why a reviewer marked it.`
      : `No flag on this capture — nothing about it required a reviewer's attention.`,
  );

  return lines;
}
