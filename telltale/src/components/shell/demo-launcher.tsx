"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Play } from "lucide-react";
import { cn } from "cn";
import { DEMO_SCENARIOS, normalisePath } from "@/lib/nav";

/**
 * PRD §10: a small fixed control on every page so the presenter never navigates
 * during the video. The single highest-value piece of demo insurance in the
 * build.
 *
 * It is a horizontal strip rather than a panel, and it collapses, because a
 * fixed block in the bottom-right corner sits on top of the last rows of every
 * table on every page — which is exactly where a judge scrolls to.
 *
 * These three labels are the only place the presenter shorthand names appear
 * (PRD §6). Inside the investigation UI a subject is a pseudonym.
 */
export function DemoLauncher() {
  const [open, setOpen] = useState(true);
  const pathname = normalisePath(usePathname());

  return (
    <div className="fixed right-4 bottom-4 z-30 flex items-stretch overflow-hidden rounded-sm border border-purple/30 bg-white">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex items-center gap-1.5 bg-purple px-2.5 text-white hover:bg-purple-dk"
      >
        <Play className="size-3" />
        <span className="label">Demo</span>
        <ChevronDown className={cn("size-3 transition-transform", open ? "" : "-rotate-90")} />
      </button>

      {open && (
        <ul className="flex items-stretch divide-x divide-line">
          {DEMO_SCENARIOS.map((s) => {
            const active = pathname === s.href;
            return (
              <li key={s.href} className="flex">
                <Link
                  href={s.href}
                  className={cn(
                    "flex items-center px-3 py-1.5 text-xs whitespace-nowrap",
                    active ? "bg-purple-lt font-medium text-purple" : "text-ink hover:bg-purple-lt hover:text-purple",
                  )}
                >
                  {s.label}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
