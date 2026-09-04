import { useMemo, useState } from "react";
import type { EventItem, TimelineLabel } from "../types";
import { appLabel, formatDate, TIMELINE_LABEL_COLOR } from "../lib/style";
import { Pill } from "./ui";

const LABELS: TimelineLabel[] = ["NORMAL", "CONTEXTUAL", "ANOMALOUS", "SUSPICIOUS", "HIGH_RISK"];
const APPS = ["SOCIAL", "GMAIL", "FINANCE"];

function groupByDay(events: EventItem[]) {
  const groups = new Map<string, EventItem[]>();
  for (const e of events) {
    const day = new Date(e.timestamp).toDateString();
    if (!groups.has(day)) groups.set(day, []);
    groups.get(day)!.push(e);
  }
  return Array.from(groups.entries());
}

export default function EventTimeline({ events, showUser = false }: { events: EventItem[]; showUser?: boolean }) {
  const [labelFilter, setLabelFilter] = useState<TimelineLabel | null>(null);
  const [appFilter, setAppFilter] = useState<string | null>(null);

  const filtered = useMemo(
    () => events.filter((e) => (!labelFilter || e.label === labelFilter) && (!appFilter || e.application === appFilter)),
    [events, labelFilter, appFilter]
  );
  const grouped = useMemo(() => groupByDay(filtered), [filtered]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Pill active={labelFilter === null} onClick={() => setLabelFilter(null)}>All severities</Pill>
        {LABELS.map((l) => (
          <Pill key={l} active={labelFilter === l} onClick={() => setLabelFilter(l)}>{l.replace("_", " ")}</Pill>
        ))}
        <span className="w-px h-4 mx-1" style={{ background: "var(--border)" }} />
        <Pill active={appFilter === null} onClick={() => setAppFilter(null)}>All apps</Pill>
        {APPS.map((a) => (
          <Pill key={a} active={appFilter === a} onClick={() => setAppFilter(a)}>{appLabel(a)}</Pill>
        ))}
      </div>

      {grouped.length === 0 && (
        <div className="py-10 text-center text-sm" style={{ color: "var(--text-faint)" }}>No events match these filters.</div>
      )}

      <div className="flex flex-col gap-5">
        {grouped.map(([day, dayEvents]) => (
          <div key={day}>
            <div className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "var(--text-faint)" }}>
              {new Date(day).toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}
            </div>
            <div className="flex flex-col">
              {dayEvents.map((e) => (
                <div key={e.id} className="flex items-start gap-3 py-2 border-l-2 pl-3 ml-1" style={{ borderColor: TIMELINE_LABEL_COLOR[e.label ?? "NORMAL"] }}>
                  <span className="text-xs w-12 shrink-0 pt-0.5" style={{ color: "var(--text-faint)" }}>
                    {new Date(e.timestamp).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm flex items-center gap-2 flex-wrap">
                      <span className="font-medium">{appLabel(e.application)}</span>
                      <span style={{ color: "var(--text-muted)" }}>{e.action.replace(/_/g, " ").toLowerCase()}</span>
                      {showUser && <span className="text-xs" style={{ color: "var(--text-faint)" }}>· {e.user_name}</span>}
                      {e.device_label && <span className="text-xs" style={{ color: "var(--text-faint)" }}>· {e.device_label}</span>}
                      {e.location && <span className="text-xs" style={{ color: "var(--text-faint)" }}>· {e.location}</span>}
                    </div>
                    {e.signal_reasons && e.signal_reasons.length > 0 && (
                      <div className="text-xs mt-0.5" style={{ color: "var(--text-faint)" }}>{e.signal_reasons[0]}</div>
                    )}
                  </div>
                  <span
                    className="text-[10px] font-bold uppercase rounded px-1.5 py-0.5 shrink-0"
                    style={{ color: TIMELINE_LABEL_COLOR[e.label ?? "NORMAL"], background: "var(--bg-inset)" }}
                  >
                    {(e.label ?? "NORMAL").replace("_", " ")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function formatEventTime(e: EventItem) {
  return formatDate(e.timestamp);
}
