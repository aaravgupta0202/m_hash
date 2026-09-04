import type { BehavioralState } from "../types";
import { STATE_COLOR, STATE_LABEL } from "../lib/style";

const STATES: BehavioralState[] = ["NORMAL", "DRIFT", "SUSPICIOUS", "HIGH_RISK"];

/** The central visual concept of the product: where a user sits on the
 * NORMAL -> DRIFT -> SUSPICIOUS -> HIGH_RISK trajectory right now. */
export default function BehavioralStateTrack({ current, riskScore }: { current: BehavioralState; riskScore: number }) {
  const currentIndex = STATES.indexOf(current);
  const markerPct = Math.min(98, Math.max(1, riskScore));

  return (
    <div className="w-full">
      <div className="relative h-2 rounded-full flex overflow-hidden" style={{ background: "var(--bg-inset)" }}>
        {STATES.map((s, i) => (
          <div key={s} className="flex-1" style={{ background: i <= currentIndex ? STATE_COLOR[s] : "transparent" }} />
        ))}
      </div>
      <div
        className="relative"
        style={{ marginTop: -4 }}
      >
        <div
          className="absolute -top-1 w-4 h-4 rounded-full border-2 shadow-sm transition-all"
          style={{ left: `calc(${markerPct}% - 8px)`, background: STATE_COLOR[current], borderColor: "var(--bg-elevated)" }}
          title={`Current: ${STATE_LABEL[current]} (${riskScore.toFixed(0)})`}
        />
      </div>
      <div className="flex justify-between mt-3">
        {STATES.map((s, i) => (
          <div key={s} className="flex flex-col items-center gap-1" style={{ opacity: i <= currentIndex ? 1 : 0.4 }}>
            <span className="w-2 h-2 rounded-full" style={{ background: STATE_COLOR[s] }} />
            <span className="text-[11px] font-semibold" style={{ color: i === currentIndex ? STATE_COLOR[s] : "var(--text-faint)" }}>
              {STATE_LABEL[s]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
