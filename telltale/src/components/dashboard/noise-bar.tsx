"use client";

import { useState } from "react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { cn } from "cn";
import { NOISE_SEGMENTS, RAISED_ANOMALIES } from "@/lib/fixtures";

/**
 * PRD §5.1: "Where the noise went" — a horizontal stacked bar. Escalated is the
 * accent; everything else is muted, because the argument of the panel is that
 * almost all of it was normal work and one sliver was not.
 *
 * The legend below the bar is the real reading surface: reason code, share and
 * count, with the count a judge can add up. They do add up — the four context
 * reason codes sum to 1,847 and the whole bar sums to 2,199, which is what
 * verify-fixtures.mjs asserts.
 */

const MUTED = ["#c9bfe4", "#b8abda", "#a798d0", "#9685c6", "#8472bb"];
const ACCENT = "var(--tt-red)";

const row = Object.fromEntries(NOISE_SEGMENTS.map((s) => [s.reasonCode, s.pct]));
const data = [{ name: "raised", ...row }];

export function NoiseBar() {
  const [active, setActive] = useState<string | null>(null);

  return (
    <div className="p-4">
      <div className="h-11 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
            <XAxis type="number" domain={[0, 100]} hide />
            <YAxis type="category" dataKey="name" hide />
            {NOISE_SEGMENTS.map((s, i) => (
              <Bar
                key={s.reasonCode}
                dataKey={s.reasonCode}
                stackId="a"
                fill={s.escalated ? ACCENT : MUTED[i % MUTED.length]}
                fillOpacity={active === null || active === s.reasonCode ? 1 : 0.4}
                stroke="var(--tt-white)"
                strokeWidth={1}
                isAnimationActive={false}
                onMouseEnter={() => setActive(s.reasonCode)}
                onMouseLeave={() => setActive(null)}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      <ul className="mt-3 divide-y divide-line border-t border-line">
        {NOISE_SEGMENTS.map((s, i) => (
          <li
            key={s.reasonCode}
            onMouseEnter={() => setActive(s.reasonCode)}
            onMouseLeave={() => setActive(null)}
            className={cn(
              "flex items-center gap-3 px-1 py-1.5",
              active === s.reasonCode && "bg-purple-lt/60",
            )}
          >
            <span
              className="size-2.5 shrink-0 rounded-sm"
              style={{ backgroundColor: s.escalated ? ACCENT : MUTED[i % MUTED.length] }}
            />
            <span className={cn("min-w-0 flex-1 truncate text-sm", s.escalated ? "font-medium text-red" : "text-ink")}>
              {s.label}
            </span>
            <span className="machine w-48 shrink-0 text-right text-[11px] text-grey">{s.reasonCode}</span>
            <span className="machine w-10 shrink-0 text-right text-xs text-ink">{s.pct}%</span>
            <span className="machine w-14 shrink-0 text-right text-xs text-grey">
              {s.count.toLocaleString("en-US")}
            </span>
          </li>
        ))}
        <li className="flex items-center gap-3 px-1 py-1.5">
          <span className="size-2.5 shrink-0" />
          <span className="min-w-0 flex-1 text-sm font-medium text-purple">Raised anomalies</span>
          <span className="machine w-48 shrink-0 text-right text-[11px] text-grey">TOTAL</span>
          <span className="machine w-10 shrink-0 text-right text-xs text-ink">100%</span>
          <span className="machine w-14 shrink-0 text-right text-xs font-medium text-purple">
            {RAISED_ANOMALIES.toLocaleString("en-US")}
          </span>
        </li>
      </ul>
    </div>
  );
}
