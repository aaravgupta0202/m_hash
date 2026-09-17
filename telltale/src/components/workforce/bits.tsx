import { cn } from "cn";
import type { CategoryTime } from "@/lib/fixtures";

/**
 * Workforce module primitives.
 *
 * PRD §7.2 is the constraint that shapes this file. Time by category is real
 * telemetry and is reported as such. There is no "productive" category, no
 * composite score, and no ranking of one member against another — composition
 * is a behavioural fact, and productivity is a management judgement that must
 * not touch a risk model. So `CategoryDonut` prints minutes and shares, and
 * nothing else.
 *
 * PRD §5.6 asks for green active and blue idle. The palette in §8 has no blue
 * and §8 governs colour, so idle is purple. Offline is the page background,
 * drawn as an empty cell rather than a colour, because "not at work" is not a
 * state anyone should be able to read a judgement into.
 */

const STATE_CLASS = {
  active: "bg-emerald-600",
  idle: "bg-emerald-200",
  offline: "bg-slate-200",
} as const;

export const STATE_LABEL = { active: "Active", idle: "Idle", offline: "Offline" } as const;

export function ActivityRibbon({
  ribbon,
  showHours = false,
}: {
  ribbon: readonly ("active" | "idle" | "offline")[];
  showHours?: boolean;
}) {
  return (
    <div className="min-w-48">
      <div className="flex gap-px overflow-hidden rounded-[3px] border border-line bg-slate-100 p-0.5">
        {ribbon.map((state, h) => (
          <div
            key={h}
            title={`${String(h).padStart(2, "0")}:00 — ${STATE_LABEL[state]}`}
            className={cn("h-3.5 flex-1 rounded-[1px]", STATE_CLASS[state])}
          />
        ))}
      </div>
      {showHours && (
        <div className="machine mt-1 flex justify-between text-[9px] text-slate-500">
          {[0, 6, 12, 18, 24].map((h) => (
            <span key={h}>{String(h).padStart(2, "0")}:00</span>
          ))}
        </div>
      )}
    </div>
  );
}

export function RibbonLegend() {
  return (
    <div className="flex items-center gap-4">
      {(["active", "idle", "offline"] as const).map((s) => (
        <span key={s} className="flex items-center gap-1.5">
          <span className={cn("size-2.5 rounded-sm", STATE_CLASS[s])} />
          <span className="text-[11px] text-slate-500">{STATE_LABEL[s]}</span>
        </span>
      ))}
    </div>
  );
}

const CATEGORY_COLOR: Record<string, string> = {
  development: "#059669",
  browser: "#0284c7",
  communication: "#4f46e5",
  "file management": "#0d9488",
  administrative: "#d97706",
  other: "#64748b",
};

export function categoryColor(category: string) {
  return CATEGORY_COLOR[category] ?? "#64748b";
}

/** Time by category — never "productivity" (PRD §7.2). */
export function CategoryDonut({ data }: { data: CategoryTime[] }) {
  const total = data.reduce((a, d) => a + d.minutes, 0);
  const R = 52;
  const STROKE = 18;
  const C = 2 * Math.PI * R;

  /* Arc offsets are precomputed rather than accumulated inside the map, so the
     geometry does not depend on render order. */
  const arcs = data.map((d, i) => ({
    ...d,
    length: (d.minutes / total) * C,
    offset: (data.slice(0, i).reduce((a, x) => a + x.minutes, 0) / total) * C,
  }));

  return (
    <div className="flex items-center gap-5">
      <svg viewBox="0 0 140 140" width="140" height="140" className="shrink-0">
        <g transform="rotate(-90 70 70)">
          {arcs.map((d) => (
            <circle
              key={d.category}
              cx="70"
              cy="70"
              r={R}
              fill="none"
              stroke={categoryColor(d.category)}
              strokeWidth={STROKE}
              strokeDasharray={`${d.length} ${C - d.length}`}
              strokeDashoffset={-d.offset}
            >
              <title>{`${d.category} — ${fmtHours(d.minutes)}`}</title>
            </circle>
          ))}
        </g>
        <text x="70" y="66" textAnchor="middle" fontSize="18" className="machine" fill="#0f172a" fontWeight="700">
          {fmtHours(total)}
        </text>
        <text x="70" y="80" textAnchor="middle" fontSize="8.5" fill="#64748b" className="label font-bold">
          Tracked
        </text>
      </svg>

      <ul className="min-w-0 flex-1 space-y-1">
        {data.map((d) => (
          <li key={d.category} className="flex items-center gap-2">
            <span className="size-2.5 shrink-0 rounded-sm" style={{ backgroundColor: categoryColor(d.category) }} />
            <span className="min-w-0 flex-1 truncate text-xs text-slate-700 capitalize">{d.category}</span>
            <span className="machine shrink-0 text-xs text-slate-500">{fmtHours(d.minutes)}</span>
            <span className="machine w-10 shrink-0 text-right text-xs text-slate-900 font-semibold">
              {Math.round((d.minutes / total) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function fmtHours(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h === 0 ? `${m}m` : `${h}h ${String(m).padStart(2, "0")}m`;
}

