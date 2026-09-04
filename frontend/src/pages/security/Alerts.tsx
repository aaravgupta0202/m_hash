import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../services/api";
import type { AlertItem, AlertSeverity, AlertStatus } from "../../types";
import { Card, LoadingState, Pill, SeverityBadge, StateBadge } from "../../components/ui";
import { appLabel, formatDate } from "../../lib/style";

const SEVERITIES: AlertSeverity[] = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];
const STATUSES: AlertStatus[] = ["OPEN", "ACKNOWLEDGED", "MARKED_BENIGN", "MARKED_EXPECTED", "MARKED_SUSPICIOUS", "CONFIRMED_INCIDENT"];

export default function Alerts() {
  const [alerts, setAlerts] = useState<AlertItem[] | null>(null);
  const [severity, setSeverity] = useState<AlertSeverity | null>(null);
  const [status, setStatus] = useState<AlertStatus | null>(null);

  useEffect(() => {
    setAlerts(null);
    api.alerts({ severity: severity ?? undefined, status: status ?? undefined }).then(setAlerts);
  }, [severity, status]);

  return (
    <div className="p-6 max-w-[1400px] mx-auto flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-semibold">Alerts</h1>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Generated only when correlated, above-threshold behavioral risk is detected — never one per anomaly.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium mr-1" style={{ color: "var(--text-faint)" }}>Severity</span>
        <Pill active={severity === null} onClick={() => setSeverity(null)}>All</Pill>
        {SEVERITIES.map((s) => (
          <Pill key={s} active={severity === s} onClick={() => setSeverity(s)}>{s}</Pill>
        ))}
        <span className="w-px h-4 mx-2" style={{ background: "var(--border)" }} />
        <span className="text-xs font-medium mr-1" style={{ color: "var(--text-faint)" }}>Status</span>
        <Pill active={status === null} onClick={() => setStatus(null)}>All</Pill>
        {STATUSES.map((s) => (
          <Pill key={s} active={status === s} onClick={() => setStatus(s)}>{s.replace(/_/g, " ")}</Pill>
        ))}
      </div>

      <Card>
        {alerts === null && <LoadingState />}
        {alerts && alerts.length === 0 && (
          <div className="py-12 text-center text-sm" style={{ color: "var(--text-faint)" }}>No alerts match these filters.</div>
        )}
        {alerts && alerts.length > 0 && (
          <div className="divide-y" style={{ borderColor: "var(--border)" }}>
            {alerts.map((a) => (
              <Link
                key={a.id}
                to={`/security/alerts/${a.id}`}
                className="flex items-center gap-4 px-5 py-3.5 hover:opacity-80 transition-opacity"
                style={{ borderColor: "var(--border)" }}
              >
                <SeverityBadge severity={a.severity} />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium truncate">{a.title}</div>
                  <div className="text-xs truncate" style={{ color: "var(--text-faint)" }}>{a.summary}</div>
                </div>
                <div className="hidden md:flex items-center gap-1.5 shrink-0">
                  {a.affected_applications.map((app) => (
                    <span key={app} className="text-[10px] font-semibold uppercase rounded px-1.5 py-0.5" style={{ background: "var(--bg-inset)", color: "var(--text-muted)" }}>
                      {appLabel(app)}
                    </span>
                  ))}
                </div>
                <StateBadge state={a.behavioral_state} />
                <span className="text-sm font-semibold w-8 text-right shrink-0">{a.risk_score.toFixed(0)}</span>
                <span className="text-xs w-24 text-right shrink-0" style={{ color: "var(--text-faint)" }}>{formatDate(a.updated_at)}</span>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
