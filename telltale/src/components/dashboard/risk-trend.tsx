"use client";

import { useRouter } from "next/navigation";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { RISK_TREND, TREND_MARKERS, routeIdFor } from "@/lib/fixtures";

/**
 * PRD §5.1: risk over the last 30 days, mostly flat, three labelled spikes
 * corresponding to the three subjects, each clickable.
 *
 * Two of the three are spikes. #8830 is not — her calibrated score is 14,
 * because context suppressed it, and that is the point of her scenario. So her
 * marker carries both numbers: raised 69, calibrated 14. Plotting her raw 69
 * would misrepresent what the queue actually saw; plotting nothing would drop a
 * third of the story.
 */

const MARKERS = [
  ...RISK_TREND.filter((p) => p.spikeSubjectId).map((p) => ({
    date: p.date,
    risk: p.risk,
    subjectId: p.spikeSubjectId as string,
    label: p.spikeLabel as string,
    raisedRisk: undefined as number | undefined,
  })),
  ...TREND_MARKERS.map((m) => ({ ...m, raisedRisk: "raisedRisk" in m ? m.raisedRisk : undefined })),
];

export function RiskTrend() {
  const router = useRouter();

  return (
    <div className="p-4">
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={RISK_TREND} margin={{ top: 10, right: 34, bottom: 0, left: -18 }}>
            <defs>
              <linearGradient id="tt-trend" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--tt-purple)" stopOpacity="0.22" />
                <stop offset="100%" stopColor="var(--tt-purple)" stopOpacity="0.02" />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--tt-line)" strokeDasharray="2 4" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: "var(--tt-grey)", fontFamily: "var(--font-jetbrains)" }}
              interval="preserveStartEnd"
              minTickGap={44}
              tickLine={false}
              axisLine={{ stroke: "var(--tt-line)" }}
            />
            <YAxis
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
              tick={{ fontSize: 10, fill: "var(--tt-grey)", fontFamily: "var(--font-jetbrains)" }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              content={({ active, payload, label }) =>
                active && payload?.length ? (
                  <div className="rounded-sm border border-line bg-white px-2.5 py-1.5">
                    <p className="machine text-xs text-ink">{label}</p>
                    <p className="machine text-xs text-purple">peak risk {payload[0].value}</p>
                  </div>
                ) : null
              }
            />
            <Area
              type="stepAfter"
              dataKey="risk"
              stroke="var(--tt-purple)"
              strokeWidth={1.6}
              fill="url(#tt-trend)"
              isAnimationActive={false}
              dot={false}
              activeDot={{ r: 3, fill: "var(--tt-purple)", stroke: "none" }}
            />
            {MARKERS.map((m) => (
              <ReferenceDot
                key={m.subjectId}
                x={m.date}
                y={m.risk}
                r={4.5}
                fill={m.risk >= 80 ? "var(--tt-red)" : m.risk >= 50 ? "var(--tt-amber)" : "var(--tt-green)"}
                stroke="var(--tt-white)"
                strokeWidth={1.5}
                ifOverflow="visible"
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <ul className="mt-2 space-y-1 border-t border-line pt-2">
        {MARKERS.map((m) => (
          <li key={m.subjectId}>
            <button
              type="button"
              onClick={() => router.push(`/subject/${routeIdFor(m.subjectId)}`)}
              className="flex w-full items-center gap-2 rounded-sm px-1 py-1 text-left hover:bg-purple-lt"
            >
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{
                  backgroundColor:
                    m.risk >= 80 ? "var(--tt-red)" : m.risk >= 50 ? "var(--tt-amber)" : "var(--tt-green)",
                }}
              />
              <span className="machine min-w-0 truncate text-xs text-ink">{m.label}</span>
              {m.raisedRisk !== undefined && (
                <span className="label rounded-sm border border-green/40 bg-green/8 px-1.5 py-0.5 text-green">
                  suppressed
                </span>
              )}
              <span className="ml-auto shrink-0 text-[11px] whitespace-nowrap text-grey">open →</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
