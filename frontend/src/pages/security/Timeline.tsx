import { useEffect, useState } from "react";
import { api } from "../../services/api";
import type { EventItem, UserSummary } from "../../types";
import { Card, LoadingState } from "../../components/ui";
import EventTimeline from "../../components/EventTimeline";

export default function Timeline() {
  const [users, setUsers] = useState<UserSummary[] | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [events, setEvents] = useState<EventItem[] | null>(null);

  useEffect(() => {
    api.users().then((list) => {
      setUsers(list);
      setUserId((prev) => prev ?? list[0]?.id ?? null);
    });
  }, []);

  useEffect(() => {
    if (userId == null) return;
    setEvents(null);
    api.userTimeline(userId, { days: 30, limit: 500 }).then(setEvents);
  }, [userId]);

  return (
    <div className="p-6 max-w-[1100px] mx-auto flex flex-col gap-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold">Behavioral Timeline</h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Every event labeled against that user's own baseline — normal, contextual, anomalous, suspicious, or high risk.
          </p>
        </div>
        <select
          className="rounded-lg border px-3 py-1.5 text-sm"
          style={{ background: "var(--bg-inset)", borderColor: "var(--border)", color: "var(--text)" }}
          value={userId ?? ""}
          onChange={(e) => setUserId(Number(e.target.value))}
        >
          {(users ?? []).map((u) => (
            <option key={u.id} value={u.id}>{u.name} · {u.role}</option>
          ))}
        </select>
      </div>

      <Card className="p-5">
        {events ? <EventTimeline events={events} /> : <LoadingState />}
      </Card>
    </div>
  );
}
