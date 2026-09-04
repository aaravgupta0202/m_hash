import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../services/api";
import type { EventItem, UserSummary } from "../../types";
import { Card, LoadingState, Pill } from "../../components/ui";
import { appLabel, formatDate } from "../../lib/style";

const APPS = ["SOCIAL", "GMAIL", "FINANCE"];

export default function Events() {
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [events, setEvents] = useState<EventItem[] | null>(null);
  const [app, setApp] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [selected, setSelected] = useState<EventItem | null>(null);

  useEffect(() => { api.users().then(setUsers); }, []);

  useEffect(() => {
    setEvents(null);
    api.events({ application: app ?? undefined, user_id: userId ?? undefined, days: 14, limit: 300 }).then(setEvents);
  }, [app, userId]);

  const userName = (id: number) => users.find((u) => u.id === id)?.name ?? `User ${id}`;

  return (
    <div className="p-6 max-w-[1400px] mx-auto flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-semibold">Events</h1>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>Raw unified event log ingested from Social, Gmail, and Finance.</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Pill active={app === null} onClick={() => setApp(null)}>All apps</Pill>
        {APPS.map((a) => <Pill key={a} active={app === a} onClick={() => setApp(a)}>{appLabel(a)}</Pill>)}
        <span className="w-px h-4 mx-1" style={{ background: "var(--border)" }} />
        <select
          className="rounded-lg border px-2 py-1 text-xs"
          style={{ background: "var(--bg-inset)", borderColor: "var(--border)", color: "var(--text)" }}
          value={userId ?? ""}
          onChange={(e) => setUserId(e.target.value ? Number(e.target.value) : null)}
        >
          <option value="">All users</option>
          {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4 items-start">
        <Card>
          {!events && <LoadingState />}
          {events && (
            <div className="divide-y max-h-[70vh] overflow-y-auto" style={{ borderColor: "var(--border)" }}>
              {events.map((e) => (
                <button
                  key={e.id}
                  onClick={() => setSelected(e)}
                  className="w-full text-left flex items-center gap-3 px-4 py-2.5 hover:opacity-80 transition-opacity"
                  style={{ background: selected?.id === e.id ? "var(--bg-inset)" : "transparent" }}
                >
                  <span className="text-xs w-32 shrink-0" style={{ color: "var(--text-faint)" }}>{formatDate(e.timestamp)}</span>
                  <span className="text-xs font-semibold w-16 shrink-0">{appLabel(e.application)}</span>
                  <span className="text-sm truncate flex-1">{e.action.replace(/_/g, " ").toLowerCase()}</span>
                  <Link to={`/security/users/${e.user_id}`} className="text-xs shrink-0 hover:underline" style={{ color: "var(--accent)" }} onClick={(ev) => ev.stopPropagation()}>
                    {userName(e.user_id)}
                  </Link>
                </button>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-4 sticky top-4">
          {!selected ? (
            <div className="text-sm text-center py-8" style={{ color: "var(--text-faint)" }}>Select an event to inspect it.</div>
          ) : (
            <div className="flex flex-col gap-2 text-sm">
              <div className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--text-faint)" }}>Event detail</div>
              <Detail label="Timestamp" value={formatDate(selected.timestamp)} />
              <Detail label="Application" value={appLabel(selected.application)} />
              <Detail label="User" value={selected.user_name} />
              <Detail label="Action" value={selected.action} />
              <Detail label="Device" value={selected.device_label ?? "—"} />
              <Detail label="Location" value={selected.location ?? "—"} />
              <Detail label="Resource" value={selected.resource_id ?? "—"} />
              <Detail label="Resource type" value={selected.resource_type ?? "—"} />
              <Detail label="Sensitivity" value={selected.resource_sensitivity} />
              <Detail label="Data volume" value={`${selected.data_volume} KB`} />
              {Object.keys(selected.metadata ?? {}).length > 0 && (
                <div className="mt-1">
                  <div className="text-xs font-medium mb-1" style={{ color: "var(--text-faint)" }}>Metadata</div>
                  <pre className="text-xs rounded p-2 overflow-x-auto" style={{ background: "var(--bg-inset)" }}>
                    {JSON.stringify(selected.metadata, null, 2)}
                  </pre>
                </div>
              )}
              <Link to={`/security/users/${selected.user_id}`} className="text-xs mt-2 hover:underline" style={{ color: "var(--accent)" }}>
                View baseline comparison &amp; anomaly evidence for {selected.user_name} →
              </Link>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span style={{ color: "var(--text-faint)" }}>{label}</span>
      <span className="font-medium text-right truncate">{value}</span>
    </div>
  );
}
