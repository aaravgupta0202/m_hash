"use client";

import { useMemo, useRef, useState } from "react";
import { cn } from "cn";
import { SENSITIVITY_COLOR } from "@/components/risk/chips";
import type {
  CompositeTimeline,
  ContextBar,
  Sensitivity,
  TimelineTick,
} from "@/lib/fixtures";

/**
 * PRD §5.3B — the composite timeline. Hand-built SVG, not a chart library:
 * four lanes sharing one hour axis is not a chart-library shape, and the whole
 * point of the component is that the lanes cannot drift out of alignment.
 *
 * They cannot drift because there is exactly one x() in this file, and every
 * lane, every gridline, every annotation and the crosshair go through it. The
 * gridlines are drawn once, full height, across all four lanes — so the shared
 * axis is structural rather than a coincidence of four similar charts.
 *
 * The one annotation the component derives rather than reads is the
 * unauthorised-window band: a cluster of high or critical actions with no
 * context bar covering them. On #4912 that band lands exactly under the busiest
 * stretch of the TRAJECTORY lane and exactly over the hole in the CONTEXT lane,
 * which is the whole story of the page with no narration.
 */

const DAY = 1439;
const W = 1100;
const PAD_L = 104;
const PAD_R = 22;
const PLOT_W = W - PAD_L - PAD_R;

const AXIS_H = 26;
const LANES = {
  session: { top: 32, h: 38 },
  trajectory: { top: 74, h: 38 },
  context: { top: 116, h: 30 },
  /* A dedicated row for the two derived annotations. They used to be drawn
 inside the CONTEXT lane, where on a subject that has both they collided
 with the record label and with each other. */
  risk: { top: 166, h: 88 },
} as const;

const ANNOTATION_Y = 158;
const H = LANES.risk.top + LANES.risk.h + 4;

const x = (t: number) => PAD_L + (Math.max(0, Math.min(DAY, t)) / DAY) * PLOT_W;
const tAt = (px: number) => ((px - PAD_L) / PLOT_W) * DAY;
const mid = (lane: keyof typeof LANES) => LANES[lane].top + LANES[lane].h / 2;

const hhmm = (t: number) =>
  `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(Math.round(t) % 60).padStart(2, "0")}`;

const CONTEXT_FILL: Record<ContextBar["verdict"], string> = {
  authorised: "var(--tt-green)",
  partial: "var(--tt-grey)",
  absent: "var(--tt-amber)",
  suspicious: "var(--tt-red)",
};

interface Hover {
  x: number;
  y: number;
  title: string;
  lines: string[];
  tone: string;
}

export function CompositeTimelineChart({
  timeline,
}: {
  timeline: CompositeTimeline;
}) {
  const ref = useRef<SVGSVGElement>(null);
  const [cursor, setCursor] = useState<number | null>(null);
  const [hover, setHover] = useState<Hover | null>(null);

  const riskAt = useMemo(() => {
    const pts = [...timeline.risk].sort((a, b) => a.t - b.t);
    return (t: number) => {
      let v = pts[0]?.risk ?? 0;
      for (const p of pts) if (p.t <= t) v = p.risk;
      return v;
    };
  }, [timeline.risk]);

  const gaps = useMemo(() => findUnauthorisedWindows(timeline), [timeline]);
  const precedence = useMemo(() => findPrecedenceMeasure(timeline), [timeline]);

  const onMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const px = ((e.clientX - rect.left) / rect.width) * W;
    setCursor(px >= PAD_L && px <= W - PAD_R ? px : null);
  };

  const cursorT = cursor === null ? null : tAt(cursor);
  const last = timeline.risk[timeline.risk.length - 1];

  return (
    <div>
      <div className="flex items-center justify-between gap-4 border-b border-line px-4 py-2">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <Legend swatch="var(--tt-grey)" label="low" />
          <Legend swatch="var(--tt-purple)" label="medium" />
          <Legend swatch="var(--tt-amber)" label="high" />
          <Legend swatch="var(--tt-red)" label="critical" />
          <span className="flex items-center gap-1.5">
            <svg width="12" height="12" aria-hidden>
              <circle
                cx="6"
                cy="6"
                r="4.5"
                fill="none"
                stroke="var(--tt-ink)"
                strokeWidth="1.4"
              />
            </svg>
            <span className="text-[11px] text-grey">first ever</span>
          </span>
        </div>
        <p className="machine text-xs text-grey">
          {cursorT === null
            ? "hover for a crosshair"
            : `${hhmm(cursorT)} · risk ${riskAt(cursorT)}`}
        </p>
      </div>

      <div className="relative overflow-x-auto px-4 py-3">
        <div className="relative" style={{ width: W }}>
          <svg
            ref={ref}
            viewBox={`0 0 ${W} ${H}`}
            width={W}
            height={H}
            onMouseMove={onMove}
            onMouseLeave={() => {
              setCursor(null);
              setHover(null);
            }}
            className="block"
          >
            <defs>
              <linearGradient id="tt-risk-fill" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="var(--tt-purple)"
                  stopOpacity="0.28"
                />
                <stop
                  offset="100%"
                  stopColor="var(--tt-purple)"
                  stopOpacity="0.04"
                />
              </linearGradient>
              <pattern
                id="tt-hatch"
                width="6"
                height="6"
                patternTransform="rotate(45)"
                patternUnits="userSpaceOnUse"
              >
                <rect
                  width="6"
                  height="6"
                  fill="var(--tt-red)"
                  fillOpacity="0.08"
                />
                <line
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="6"
                  stroke="var(--tt-red)"
                  strokeWidth="1.6"
                  strokeOpacity="0.5"
                />
              </pattern>
            </defs>

            {/* Off-hours shading for this organisation. */}
            <rect
              x={x(0)}
              y={AXIS_H + 4}
              width={x(420) - x(0)}
              height={H - AXIS_H - 6}
              fill="var(--tt-purple)"
              fillOpacity="0.035"
            />
            <rect
              x={x(1140)}
              y={AXIS_H + 4}
              width={x(DAY) - x(1140)}
              height={H - AXIS_H - 6}
              fill="var(--tt-purple)"
              fillOpacity="0.035"
            />

            {/* One axis. Every lane is drawn against these same lines. */}
            {Array.from({ length: 25 }, (_, h) => h).map((h) => (
              <line
                key={h}
                x1={x(h * 60)}
                x2={x(h * 60)}
                y1={AXIS_H + 4}
                y2={H - 2}
                stroke="var(--tt-line)"
                strokeOpacity={h % 6 === 0 ? 1 : 0.45}
                strokeWidth={1}
              />
            ))}
            {Array.from({ length: 13 }, (_, i) => i * 2).map((h) => (
              <text
                key={h}
                x={x(h * 60)}
                y={16}
                textAnchor={h === 0 ? "start" : h === 24 ? "end" : "middle"}
                className="machine"
                fontSize="10"
                fill="var(--tt-grey)"
              >
                {String(h).padStart(2, "0")}:00
              </text>
            ))}

            {/* Derived annotation: activity with nothing authorising it. */}
            {gaps.map((g, i) => (
              <g key={i}>
                <rect
                  x={x(g.from)}
                  y={LANES.session.top - 2}
                  width={Math.max(6, x(g.to) - x(g.from))}
                  height={
                    LANES.context.top + LANES.context.h - LANES.session.top + 4
                  }
                  fill="var(--tt-red)"
                  fillOpacity="0.05"
                  stroke="var(--tt-red)"
                  strokeOpacity="0.45"
                  strokeDasharray="3 3"
                  strokeWidth="1"
                />
                <text
                  x={x(g.from)}
                  y={ANNOTATION_Y}
                  fontSize="10"
                  fill="var(--tt-red)"
                  className="label"
                >
                  ↑ No authorising record · {hhmm(g.from + 8)}–{hhmm(g.to - 8)}
                </text>
              </g>
            ))}

            {/* Lane labels and baselines. */}
            {(
              [
                [
                  "session",
                  "SESSION",
                  `${timeline.session.length} auth events`,
                ],
                [
                  "trajectory",
                  "TRAJECTORY",
                  `${timeline.trajectory.length} actions`,
                ],
                [
                  "context",
                  "CONTEXT",
                  `${timeline.context.length} record${timeline.context.length === 1 ? "" : "s"}`,
                ],
                ["risk", "RISK", "calibrated 0–100"],
              ] as const
            ).map(([key, label, sub]) => (
              <g key={key}>
                <text
                  x={0}
                  y={LANES[key].top + 12}
                  fontSize="10"
                  fill="var(--tt-purple)"
                  className="label"
                >
                  {label}
                </text>
                <text
                  x={0}
                  y={LANES[key].top + 25}
                  fontSize="9.5"
                  fill="var(--tt-grey)"
                >
                  {sub}
                </text>
                <line
                  x1={x(0)}
                  x2={x(DAY)}
                  y1={mid(key)}
                  y2={mid(key)}
                  stroke="var(--tt-line)"
                  strokeDasharray={key === "context" ? "2 4" : undefined}
                  strokeWidth="1"
                />
              </g>
            ))}

            {/* CONTEXT — bars spanning the periods an authorising record was in force. */}
            {timeline.context.map((bar) => {
              const bx = x(bar.from);
              const bw = Math.max(3, x(bar.to) - bx);
              const suspicious = bar.verdict === "suspicious";
              return (
                <g key={bar.recordId}>
                  <rect
                    x={bx}
                    y={LANES.context.top + 5}
                    width={bw}
                    height={LANES.context.h - 10}
                    rx="2"
                    fill={
                      suspicious ? "url(#tt-hatch)" : CONTEXT_FILL[bar.verdict]
                    }
                    fillOpacity={suspicious ? 1 : 0.16}
                    stroke={CONTEXT_FILL[bar.verdict]}
                    strokeOpacity="0.6"
                    onMouseEnter={() =>
                      setHover({
                        x: bx + bw / 2,
                        y: LANES.context.top,
                        title: bar.recordId,
                        lines: [
                          bar.label,
                          `${hhmm(bar.from)} → ${hhmm(bar.to)}`,
                          bar.verdict.toUpperCase(),
                        ],
                        tone: CONTEXT_FILL[bar.verdict],
                      })
                    }
                    onMouseLeave={() => setHover(null)}
                  />
                  {bw > 160 && (
                    <text
                      x={bx + 7}
                      y={LANES.context.top + LANES.context.h / 2 + 3.5}
                      fontSize="10"
                      className="machine"
                      fill={CONTEXT_FILL[bar.verdict]}
                    >
                      {bar.recordId}
                      {suspicious ? " · provenance failed" : ""}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Where a record the subject created precedes the access it covers. */}
            {precedence && (
              <g>
                <line
                  x1={x(precedence.from)}
                  x2={x(precedence.to)}
                  y1={LANES.context.top + 2}
                  y2={LANES.context.top + 2}
                  stroke="var(--tt-red)"
                  strokeWidth="1"
                />
                <line
                  x1={x(precedence.from)}
                  x2={x(precedence.from)}
                  y1={LANES.context.top - 2}
                  y2={LANES.context.top + 6}
                  stroke="var(--tt-red)"
                  strokeWidth="1"
                />
                <line
                  x1={x(precedence.to)}
                  x2={x(precedence.to)}
                  y1={LANES.context.top - 2}
                  y2={LANES.context.top + 6}
                  stroke="var(--tt-red)"
                  strokeWidth="1"
                />
                <text
                  x={x(precedence.from)}
                  y={ANNOTATION_Y}
                  fontSize="10"
                  className="machine"
                  fill="var(--tt-red)"
                >
                  ↑ {precedence.to - precedence.from}m after the record the
                  subject created
                </text>
              </g>
            )}

            {/* SESSION and TRAJECTORY ticks. */}
            {timeline.session.map((tick, i) => (
              <Tick
                key={`s${i}`}
                tick={tick}
                lane="session"
                onHover={setHover}
              />
            ))}
            {timeline.trajectory.map((tick, i) => (
              <Tick
                key={`t${i}`}
                tick={tick}
                lane="trajectory"
                onHover={setHover}
              />
            ))}

            {/* RISK — stepped area. The score changes at an event, not between events. */}
            {[0, 50, 100].map((v) => (
              <g key={v}>
                <line
                  x1={x(0)}
                  x2={x(DAY)}
                  y1={riskY(v)}
                  y2={riskY(v)}
                  stroke="var(--tt-line)"
                  strokeOpacity="0.8"
                  strokeDasharray="2 4"
                />
                <text
                  x={PAD_L - 6}
                  y={riskY(v) + 3}
                  textAnchor="end"
                  fontSize="9"
                  className="machine"
                  fill="var(--tt-grey)"
                >
                  {v}
                </text>
              </g>
            ))}
            <path d={riskArea(timeline)} fill="url(#tt-risk-fill)" />
            <path
              d={riskLine(timeline)}
              fill="none"
              stroke="var(--tt-purple)"
              strokeWidth="1.6"
            />
            {timeline.risk.map((p, i) => (
              <circle
                key={i}
                cx={x(p.t)}
                cy={riskY(p.risk)}
                r="2"
                fill="var(--tt-purple)"
              />
            ))}
            <text
              x={x(last.t) - 6}
              y={riskY(last.risk) - 6}
              textAnchor="end"
              fontSize="11"
              className="machine"
              fill="var(--tt-purple)"
              fontWeight="600"
            >
              {last.risk}
            </text>

            {/* One crosshair across all four lanes. */}
            {cursor !== null && (
              <g pointerEvents="none">
                <line
                  x1={cursor}
                  x2={cursor}
                  y1={AXIS_H}
                  y2={H - 2}
                  stroke="var(--tt-purple)"
                  strokeWidth="1"
                  strokeOpacity="0.55"
                />
                <rect
                  x={Math.min(cursor + 3, W - 54)}
                  y={AXIS_H + 2}
                  width="50"
                  height="14"
                  rx="2"
                  fill="var(--tt-purple)"
                />
                <text
                  x={Math.min(cursor + 6, W - 51)}
                  y={AXIS_H + 12}
                  fontSize="9.5"
                  className="machine"
                  fill="var(--tt-ink)"
                >
                  {hhmm(tAt(cursor))}
                </text>
              </g>
            )}
          </svg>

          {hover && (
            <div
              className="pointer-events-none absolute z-10 w-64 rounded-sm border border-line bg-white p-2.5 shadow-lg text-slate-800"
              style={{ left: Math.min(hover.x + 12, 600), top: hover.y + 12 }}
            >
              <p
                className="machine text-xs font-semibold"
                style={{ color: hover.tone }}
              >
                {hover.title}
              </p>
              {hover.lines.map((l, i) => (
                <p
                  key={i}
                  className={cn(
                    "mt-0.5 text-[11px] leading-snug",
                    i === 0 ? "machine text-ink" : "text-grey",
                  )}
                >
                  {l}
                </p>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Tick({
  tick,
  lane,
  onHover,
}: {
  tick: TimelineTick;
  lane: "session" | "trajectory";
  onHover: (h: Hover | null) => void;
}) {
  const cx = x(tick.t);
  const cy = mid(lane);
  const top = LANES[lane].top + 7;
  const bottom = LANES[lane].top + LANES[lane].h - 7;
  const color = tick.asnChange
    ? "var(--tt-red)"
    : SENSITIVITY_COLOR[tick.sensitivity as Sensitivity];

  return (
    <g
      onMouseEnter={() =>
        onHover({
          x: cx,
          y: LANES[lane].top,
          title: tick.action,
          lines: [
            tick.ts.replace("T", " ").replace("Z", " UTC"),
            tick.resource
              ? `resource · ${tick.resource}`
              : `${tick.sensitivity} sensitivity`,
            [tick.note, tick.firstEver ? "first ever in 180d" : null]
              .filter(Boolean)
              .join(" · "),
          ].filter(Boolean),
          tone: color,
        })
      }
      onMouseLeave={() => onHover(null)}
    >
      <rect
        x={cx - 6}
        y={top - 4}
        width="12"
        height={bottom - top + 8}
        fill="transparent"
      />
      <line
        x1={cx}
        x2={cx}
        y1={top}
        y2={bottom}
        stroke={color}
        strokeWidth="1.4"
        strokeOpacity="0.75"
      />
      {tick.firstEver && (
        <circle
          cx={cx}
          cy={cy}
          r="4.5"
          fill="none"
          stroke={color}
          strokeWidth="1.4"
        />
      )}
      <circle cx={cx} cy={cy} r="2.2" fill={color} />
      {tick.asnChange && (
        <path
          d={`M ${cx - 3.5} ${top - 2} L ${cx + 3.5} ${top - 2} L ${cx} ${top + 3.5} Z`}
          fill="var(--tt-red)"
        />
      )}
    </g>
  );
}

function Legend({ swatch, label }: { swatch: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span
        className="inline-block size-2 rounded-full"
        style={{ backgroundColor: swatch }}
      />
      <span className="text-[11px] text-grey">{label}</span>
    </span>
  );
}

const riskY = (r: number) =>
  LANES.risk.top +
  LANES.risk.h -
  (Math.max(0, Math.min(100, r)) / 100) * (LANES.risk.h - 8) -
  4;

function stepPoints(t: CompositeTimeline): [number, number][] {
  const pts = [...t.risk].sort((a, b) => a.t - b.t);
  const out: [number, number][] = [];
  pts.forEach((p, i) => {
    if (i > 0) out.push([x(p.t), riskY(pts[i - 1].risk)]);
    out.push([x(p.t), riskY(p.risk)]);
  });
  return out;
}

function riskLine(t: CompositeTimeline) {
  return stepPoints(t)
    .map(
      ([px, py], i) =>
        `${i === 0 ? "M" : "L"} ${px.toFixed(1)} ${py.toFixed(1)}`,
    )
    .join(" ");
}

function riskArea(t: CompositeTimeline) {
  const pts = stepPoints(t);
  if (pts.length === 0) return "";
  const base = LANES.risk.top + LANES.risk.h - 4;
  return `${riskLine(t)} L ${pts[pts.length - 1][0].toFixed(1)} ${base} L ${pts[0][0].toFixed(1)} ${base} Z`;
}

/**
 * A window is unauthorised when high or critical activity happens and no
 * context bar of authorising weight covers it. Adjacent such actions within an
 * hour are one window, so a four-step exfiltration reads as one event rather
 * than as four separate annotations.
 */
function findUnauthorisedWindows(
  t: CompositeTimeline,
): { from: number; to: number }[] {
  /*
   * A suspicious record counts as covering the activity here, even though it
   * authorises nothing. It is drawn hatched in red and carries its own
   * annotation, so labelling the same minutes "no authorising record" as well
   * put three red marks on one stretch of axis and told the wrong story: the
   * finding on that subject is that a record exists and is forged, not that
   * none exists.
   */
  const covered = (m: number) =>
    t.context.some((b) => m >= b.from && m <= b.to);
  const flagged = [...t.session, ...t.trajectory]
    .filter(
      (e) =>
        (e.sensitivity === "critical" ||
          e.sensitivity === "high" ||
          e.asnChange) &&
        !covered(e.t),
    )
    .map((e) => e.t)
    .sort((a, b) => a - b);
  if (flagged.length === 0) return [];

  const windows: { from: number; to: number }[] = [];
  let from = flagged[0];
  let prev = flagged[0];
  for (const m of flagged.slice(1)) {
    if (m - prev > 60) {
      windows.push({ from: from - 8, to: prev + 8 });
      from = m;
    }
    prev = m;
  }
  windows.push({ from: from - 8, to: prev + 8 });
  return windows;
}

/** Where a suspicious record precedes the access it was created to cover. */
function findPrecedenceMeasure(
  t: CompositeTimeline,
): { from: number; to: number } | null {
  const bar = t.context.find((b) => b.verdict === "suspicious");
  if (!bar) return null;
  const access = t.trajectory.find(
    (e) => e.t > bar.from && e.sensitivity === "critical",
  );
  if (!access) return null;
  return { from: bar.from, to: access.t };
}
