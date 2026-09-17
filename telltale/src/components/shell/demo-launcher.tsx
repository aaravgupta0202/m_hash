"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Play } from "lucide-react";
import { cn } from "cn";
import { DEMO_SCENARIOS, normalisePath } from "@/lib/nav";

const TONE_DOT: Record<string, string> = {
  "/demo/subject/8830": "bg-emerald-500",
  "/demo/subject/4912": "bg-red-500",
  "/demo/subject/2071": "bg-amber-500",
};

/**
 * PRD §10: a small fixed control on every page so the presenter never
 * navigates during the video. The single highest-value piece of demo
 * insurance in the build.
 *
 * It is a horizontal strip rather than a panel, and it collapses, because a
 * fixed block in the bottom-right corner sits on top of the last rows of
 * every table on every page — which is exactly where a judge scrolls to.
 *
 * These three labels are the only place the presenter shorthand names
 * appear (PRD §6). Inside the investigation UI a subject is a pseudonym.
 */
export function DemoLauncher() {
  const [open, setOpen] = useState(true);
  const pathname = normalisePath(usePathname());

  return (
    <div className="fixed right-4 bottom-4 left-4 z-40 flex max-w-full items-stretch overflow-hidden rounded-sm border border-line bg-white shadow-lg sm:left-auto sm:w-auto">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex shrink-0 items-center gap-1.5 bg-emerald-700 px-3 py-1.5 text-white hover:bg-emerald-800"
      >
        <Play className="size-3 fill-current" />
        <span className="text-xs font-medium">Demo scenarios</span>
        <ChevronDown
          className={cn(
            "size-3.5 transition-transform duration-200",
            open ? "" : "-rotate-90",
          )}
        />
      </button>

      {open && (
        <ul className="flex items-stretch divide-x divide-line overflow-x-auto">
          {DEMO_SCENARIOS.map((s) => {
            const active = pathname === s.href;
            const dot = TONE_DOT[s.href] ?? "bg-emerald-500";
            return (
              <li key={s.href} className="flex">
                <Link
                  href={s.href}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 text-xs whitespace-nowrap",
                    active
                      ? "bg-emerald-50 font-medium text-emerald-900"
                      : "text-slate-600 hover:bg-slate-50",
                  )}
                >
                  <span className={cn("size-1.5 rounded-full", dot)} />
                  <span>{s.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
