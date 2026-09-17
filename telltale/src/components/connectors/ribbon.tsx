import { getBrandSlug } from "@/lib/brand-icons";
import { CONNECTORS, CONNECTOR_RIBBONS, type ConnectorState } from "@/lib/fixtures";

/**
 * PRD §5.4: one continuous bar per connector across a 24-hour axis, green where
 * healthy, amber where degraded, red where silent.
 *
 * Same construction as the composite timeline and for the same reason: one x()
 * and one set of gridlines, so six rows cannot drift apart. AWS CloudTrail goes
 * red at 19:12, which is the same minute the chip on the dashboard is counting
 * from.
 */

const DAY = 1439;
const W = 1040;
const PAD_L = 132;
const PAD_R = 16;
const PLOT_W = W - PAD_L - PAD_R;
const ROW_H = 36;
const BAR_H = 13;
const AXIS_H = 22;

const x = (t: number) => PAD_L + (t / DAY) * PLOT_W;

const FILL: Record<ConnectorState, string> = {
  healthy: "var(--tt-green)",
  degraded: "var(--tt-amber)",
  silent: "var(--tt-red)",
};

export function ConnectorRibbons() {
  const H = AXIS_H + CONNECTORS.length * ROW_H + 8;

  return (
    <div className="overflow-x-auto p-4">
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="block">
        {Array.from({ length: 25 }, (_, h) => h).map((h) => (
          <line
            key={h}
            x1={x(h * 60)}
            x2={x(h * 60)}
            y1={AXIS_H - 6}
            y2={H - 6}
            stroke="var(--tt-line)"
            strokeOpacity={h % 6 === 0 ? 1 : 0.4}
          />
        ))}
        {Array.from({ length: 13 }, (_, i) => i * 2).map((h) => (
          <text
            key={h}
            x={x(h * 60)}
            y={12}
            textAnchor={h === 0 ? "start" : h === 24 ? "end" : "middle"}
            fontSize="10"
            className="machine"
            fill="var(--tt-grey)"
          >
            {String(h).padStart(2, "0")}:00
          </text>
        ))}

        {CONNECTORS.map((c, i) => {
          const ribbon = CONNECTOR_RIBBONS.find((r) => r.connectorId === c.id);
          const y = AXIS_H + i * ROW_H;
          return (
            <g key={c.id}>
              <image href={`/brand-icons/${getBrandSlug(c.name)}.svg`} x={0} y={y + 1} width="14" height="14" />
              <text x={20} y={y + BAR_H} fontSize="11" fill="var(--tt-ink)">
                {c.name}
              </text>
              <rect
                x={x(0)}
                y={y + 2}
                width={PLOT_W}
                height={BAR_H}
                rx="2"
                fill="var(--tt-purple-lt)"
                fillOpacity="0.7"
              />
              {ribbon?.segments.map((seg, j) => (
                <rect
                  key={j}
                  x={x(seg.from)}
                  y={y + 2}
                  width={Math.max(1.5, x(seg.to) - x(seg.from))}
                  height={BAR_H}
                  rx="2"
                  fill={FILL[seg.state]}
                  fillOpacity={seg.state === "healthy" ? 0.5 : 0.85}
                >
                  <title>{`${c.name} — ${seg.state} ${hhmm(seg.from)} to ${hhmm(seg.to)}`}</title>
                </rect>
              ))}
              {/*
               * Two adjacent non-healthy segments put their labels 45px apart
               * on a 100px-wide string, which rendered as one unreadable
               * overlap. Labels that would collide drop to a second line.
               */}
              {labelRows(ribbon?.segments ?? []).map((l, j) => (
                <text
                  key={`l${j}`}
                  x={x(l.from) + 4}
                  y={y + BAR_H + 12 + l.row * 11}
                  fontSize="9.5"
                  className="machine"
                  fill={FILL[l.state]}
                >
                  {l.state} from {hhmm(l.from)}
                </text>
              ))}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/** Estimated advance width of the label text at 9.5px in the mono face. */
const CHAR_W = 5.4;

function labelRows(
  segments: { from: number; to: number; state: ConnectorState }[],
) {
  const out: { from: number; state: ConnectorState; row: number }[] = [];
  for (const seg of segments) {
    if (seg.state === "healthy") continue;
    const text = `${seg.state} from ${hhmm(seg.from)}`;
    const start = x(seg.from) + 4;
    const end = start + text.length * CHAR_W;
    let row = 0;
    while (
      out.some(
        (o) =>
          o.row === row &&
          x(o.from) + 4 + `${o.state} from ${hhmm(o.from)}`.length * CHAR_W >
            start &&
          x(o.from) + 4 < end,
      )
    ) {
      row += 1;
    }
    out.push({ from: seg.from, state: seg.state, row });
  }
  return out;
}

function hhmm(t: number) {
  return `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
}
