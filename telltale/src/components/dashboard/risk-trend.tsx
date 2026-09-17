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
                <stop offset="0%" stopColor="#059669" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#059669" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#e2e8f0" strokeDasharray="2 4" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: "#64748b", fontFamily: "var(--font-jetbrains)" }}
              interval="preserveStartEnd"
              minTickGap={44}
              tickLine={false}
              axisLine={{ stroke: "#e2e8f0" }}
            />
            <YAxis
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
              tick={{ fontSize: 10, fill: "#64748b", fontFamily: "var(--font-jetbrains)" }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              content={({ active, payload, label }) =>
                active && payload?.length ? (
                  <div className="rounded-lg border border-line bg-white px-3 py-2 shadow-lg">
                    <p className="machine text-xs text-slate-700 font-semibold">{label}</p>
                    <p className="machine text-xs text-emerald-700 font-bold">peak risk {payload[0].value}</p>
                  </div>
                ) : null
              }
            />
            <Area
              type="stepAfter"
              dataKey="risk"
              stroke="#059669"
              strokeWidth={2}
              fill="url(#tt-trend)"
              isAnimationActive={false}
              dot={false}
              activeDot={{ r: 4, fill: "#059669", stroke: "#ffffff", strokeWidth: 2 }}
            />
            {MARKERS.map((m) => (
              <ReferenceDot
                key={m.subjectId}
                x={m.date}
                y={m.risk}
                r={5}
                fill={m.risk >= 80 ? "#dc2626" : m.risk >= 50 ? "#d97706" : "#059669"}
                stroke="#ffffff"
                strokeWidth={2}
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
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-slate-100 transition-colors"
            >
              <span
                className="size-2 rounded-full shrink-0"
                style={{
                  backgroundColor: m.risk >= 80 ? "#dc2626" : m.risk >= 50 ? "#d97706" : "#059669",
                }}
              />
              <span className="machine text-xs font-bold text-slate-900">{m.label.split(" ")[0]}</span>
              <span className="text-xs text-slate-600 truncate">{m.label.split(" ").slice(1).join(" ")}</span>
              <span className="machine ml-auto text-xs text-slate-500">
                {m.raisedRisk !== undefined ? `raised ${m.raisedRisk} → ` : ""}
                calibrated {m.risk}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
