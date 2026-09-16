import type { CohortComparison } from "@/lib/fixtures";

/**
 * PRD §5.3F: cohort members as dots on a metric axis with the subject as a
 * distinct marker, and the comparison stated in words underneath.
 *
 * Two things this component does that a generic strip plot would not:
 *
 * 1. It draws the median and the robust band (median ± 1.4826·MAD), so the
 *    Z-score printed in the contribution table is visible as a distance rather
 *    than asserted as a number. One MAD-unit is one tick of the band.
 * 2. When the subject is far outside the cohort — #4912 touched 410 resources
 *    against a median of 12 — it breaks the axis rather than compressing the
 *    cohort into a single pixel column. The break is drawn and labelled,
 *    because a silently non-linear axis is a way of lying with a chart.
 */

const W = 1000;
const H = 142;
const PAD_L = 14;
const PAD_R = 14;
const AXIS_Y = 92;
const DOT_Y = 62;

export function CohortStrip({ comparison }: { comparison: CohortComparison }) {
  const { stats, subjectValue, zScore, metric, caption } = comparison;
  const peers = [...stats.values].sort((a, b) => a - b);
  const peerMax = peers[peers.length - 1] ?? 1;

  /* Break the axis only when the subject is genuinely off-scale. */
  const broken = subjectValue > peerMax * 1.6;
  const domainMax = broken ? peerMax * 1.08 : Math.max(subjectValue, peerMax) * 1.08;
  const plotRight = broken ? W - PAD_R - 96 : W - PAD_R - 24;
  const plotW = plotRight - PAD_L;

  const x = (v: number) => PAD_L + (Math.min(v, domainMax) / domainMax) * plotW;
  const subjectX = broken ? W - PAD_R - 40 : x(subjectValue);

  const band = 1.4826 * stats.mad;
  const ticks = axisTicks(domainMax);

  return (
    <div>
      <div className="overflow-x-auto px-4 pt-3">
        <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="block">
          {/* Robust band: one unit either side of the median. */}
          <rect
            x={x(Math.max(0, stats.median - band))}
            y={DOT_Y - 26}
            width={x(stats.median + band) - x(Math.max(0, stats.median - band))}
            height={52}
            fill="var(--tt-purple)"
            fillOpacity="0.07"
          />
          <line
            x1={x(stats.median)}
            x2={x(stats.median)}
            y1={DOT_Y - 30}
            y2={AXIS_Y}
            stroke="var(--tt-purple)"
            strokeWidth="1.4"
          />
          <text x={x(stats.median)} y={DOT_Y - 36} textAnchor="middle" fontSize="10" className="machine" fill="var(--tt-purple)">
            median {stats.median}
          </text>
          <text
            x={x(stats.median + band)}
            y={DOT_Y - 36}
            textAnchor="middle"
            fontSize="9.5"
            className="machine"
            fill="var(--tt-grey)"
          >
            +1 MAD-unit
          </text>

          {/* Axis */}
          <line x1={PAD_L} x2={plotRight} y1={AXIS_Y} y2={AXIS_Y} stroke="var(--tt-line)" />
          {ticks
            .filter((t) => Math.abs(x(t) - subjectX) > 26)
            .map((t) => (
            <g key={t}>
              <line x1={x(t)} x2={x(t)} y1={AXIS_Y} y2={AXIS_Y + 4} stroke="var(--tt-line)" />
              <text x={x(t)} y={AXIS_Y + 15} textAnchor="middle" fontSize="9.5" className="machine" fill="var(--tt-grey)">
                {t}
              </text>
            </g>
          ))}

          {/* Peers */}
          {pack(peers, x).map((p, i) => (
            <circle key={i} cx={p.cx} cy={DOT_Y - p.row * 8} r="3.2" fill="var(--tt-grey)" fillOpacity="0.5">
              <title>{`peer — ${peers[i]} ${metric.toLowerCase()}`}</title>
            </circle>
          ))}

          {/* Axis break */}
          {broken && (
            <g>
              <line
                x1={plotRight + 10}
                x2={plotRight + 10}
                y1={AXIS_Y - 40}
                y2={AXIS_Y + 6}
                stroke="var(--tt-white)"
                strokeWidth="8"
              />
              <path
                d={`M ${plotRight + 6} ${AXIS_Y + 6} l 8 -6 l -8 -6 l 8 -6`}
                fill="none"
                stroke="var(--tt-grey)"
                strokeWidth="1.2"
              />
              <line x1={plotRight + 20} x2={subjectX - 18} y1={AXIS_Y} y2={AXIS_Y} stroke="var(--tt-line)" strokeDasharray="3 3" />
              {/* Second line: the subject label already occupies the first. */}
              <text x={plotRight + 22} y={AXIS_Y + 27} fontSize="9" fill="var(--tt-grey)">
                axis broken
              </text>
            </g>
          )}

          {/* Subject */}
          <g>
            <line x1={subjectX} x2={subjectX} y1={DOT_Y - 34} y2={AXIS_Y} stroke="var(--tt-red)" strokeWidth="1.4" />
            <rect x={subjectX - 5} y={DOT_Y - 5} width="10" height="10" fill="var(--tt-red)" transform={`rotate(45 ${subjectX} ${DOT_Y})`}>
              <title>{`subject — ${subjectValue} ${metric.toLowerCase()}`}</title>
            </rect>
            <text x={subjectX} y={DOT_Y - 40} textAnchor="middle" fontSize="10.5" className="machine" fill="var(--tt-red)" fontWeight="600">
              {subjectValue}
            </text>
            <text x={subjectX} y={AXIS_Y + 15} textAnchor="middle" fontSize="9.5" className="machine" fill="var(--tt-red)">
              subject
            </text>
          </g>

          {/* The statistic, stated where the reader is already looking. */}
          <text x={PAD_L} y={H - 4} fontSize="10" className="machine" fill="var(--tt-grey)">
            n = {stats.n} peers · median {stats.median} · MAD {stats.mad} · robust Z ={" "}
            <tspan fill={Math.abs(zScore) > 3 ? "var(--tt-red)" : "var(--tt-ink)"} fontWeight="600">
              {zScore >= 0 ? "+" : "−"}
              {Math.abs(zScore).toFixed(2)}
            </tspan>
          </text>
        </svg>
      </div>

      <p className="border-t border-line bg-purple-lt/40 px-4 py-2.5 text-xs leading-relaxed text-grey">
        {caption}
      </p>
    </div>
  );
}

/**
 * Deterministic beeswarm packing — no randomness, so the plot is identical in
 * the recording and on the judge's screen. Dots that would overlap stack
 * upward instead of jittering.
 */
function pack(values: number[], x: (v: number) => number) {
  const placed: { cx: number; row: number }[] = [];
  for (const v of values) {
    const cx = x(v);
    let row = 0;
    while (placed.some((p) => p.row === row && Math.abs(p.cx - cx) < 7.2)) row += 1;
    placed.push({ cx, row });
  }
  return placed;
}

function axisTicks(max: number): number[] {
  const step = niceStep(max / 5);
  const out: number[] = [];
  for (let v = 0; v <= max; v += step) out.push(Math.round(v));
  return out;
}

function niceStep(raw: number): number {
  const pow = Math.pow(10, Math.floor(Math.log10(Math.max(raw, 1))));
  const n = raw / pow;
  const mult = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10;
  return mult * pow;
}
