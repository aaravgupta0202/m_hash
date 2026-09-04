import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, MessageSquare } from "lucide-react";
import { api } from "../../services/api";
import type { AlertItem } from "../../types";
import { Button, Card, CardHeader, LoadingState, SeverityBadge, StateBadge } from "../../components/ui";
import { appLabel, formatDate, SEVERITY_COLOR } from "../../lib/style";

const FEEDBACK_OPTIONS: { type: string; label: string; variant: "secondary" | "danger" | "primary" }[] = [
  { type: "ACKNOWLEDGE", label: "Acknowledge", variant: "secondary" },
  { type: "MARK_BENIGN", label: "Mark Benign", variant: "secondary" },
  { type: "MARK_EXPECTED", label: "Mark Expected", variant: "secondary" },
  { type: "MARK_SUSPICIOUS", label: "Mark Suspicious", variant: "danger" },
  { type: "CONFIRM_INCIDENT", label: "Confirm Incident", variant: "danger" },
];

export default function AlertDetail() {
  const { id } = useParams();
  const [alert, setAlert] = useState<AlertItem | null>(null);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = () => api.alert(Number(id)).then(setAlert);
  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [id]);

  if (!alert) return <LoadingState />;

  const submitFeedback = async (feedback_type: string) => {
    setSubmitting(true);
    try {
      const updated = await api.alertFeedback(alert.id, { feedback_type, notes, analyst_name: "Security Analyst" });
      setAlert(updated);
      setNotes("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-[1100px] mx-auto flex flex-col gap-5">
      <Link to="/security/alerts" className="flex items-center gap-1.5 text-sm w-fit" style={{ color: "var(--text-muted)" }}>
        <ArrowLeft size={14} /> Back to alerts
      </Link>

      <Card className="p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <SeverityBadge severity={alert.severity} />
              <StateBadge state={alert.behavioral_state} />
              <span className="text-xs rounded px-1.5 py-0.5 font-medium" style={{ background: "var(--bg-inset)", color: "var(--text-muted)" }}>{alert.status.replace(/_/g, " ")}</span>
            </div>
            <h1 className="text-lg font-semibold">{alert.title}</h1>
            <Link to={`/security/users/${alert.user_id}`} className="text-sm hover:underline" style={{ color: "var(--accent)" }}>
              {alert.user_name} · {alert.role}
            </Link>
          </div>
          <div className="text-right shrink-0">
            <div className="text-3xl font-bold" style={{ color: SEVERITY_COLOR[alert.severity] }}>{alert.risk_score.toFixed(0)}</div>
            <div className="text-xs" style={{ color: "var(--text-faint)" }}>{alert.confidence.toFixed(0)}% confidence</div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5 text-xs">
          <div><div style={{ color: "var(--text-faint)" }}>First observed</div><div className="font-medium mt-0.5">{formatDate(alert.first_observed)}</div></div>
          <div><div style={{ color: "var(--text-faint)" }}>Latest observed</div><div className="font-medium mt-0.5">{formatDate(alert.last_observed)}</div></div>
          <div><div style={{ color: "var(--text-faint)" }}>Applications</div><div className="font-medium mt-0.5">{alert.affected_applications.map(appLabel).join(", ") || "—"}</div></div>
          <div><div style={{ color: "var(--text-faint)" }}>Resources</div><div className="font-medium mt-0.5">{alert.affected_resources.length}</div></div>
        </div>
      </Card>

      <Card>
        <CardHeader title="Why is this suspicious?" subtitle="Deterministically generated from detection evidence — no black box" />
        <div className="px-5 pb-5">
          <p className="text-sm mb-3" style={{ color: "var(--text-muted)" }}>{alert.summary}</p>
          <ul className="flex flex-col gap-2">
            {(alert.evidence ?? []).map((e) => (
              <li key={e.id} className="flex items-start gap-2 text-sm">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ background: SEVERITY_COLOR[e.severity] }} />
                <span>
                  {e.description}
                  {e.application && <span className="text-xs ml-2" style={{ color: "var(--text-faint)" }}>({appLabel(e.application)})</span>}
                </span>
              </li>
            ))}
          </ul>
          {alert.context_notes.length > 0 && (
            <div className="mt-4 pt-4 border-t text-sm" style={{ borderColor: "var(--border)" }}>
              <div className="font-medium mb-1.5" style={{ color: "var(--text)" }}>Context</div>
              {alert.context_notes.map((n, i) => (
                <p key={i} style={{ color: "var(--text-muted)" }}>{n}</p>
              ))}
            </div>
          )}
        </div>
      </Card>

      <Card>
        <CardHeader title="Investigate" subtitle="Record analyst feedback — this is stored, not used to silently retrain anything" right={<MessageSquare size={16} style={{ color: "var(--text-faint)" }} />} />
        <div className="px-5 pb-5 flex flex-col gap-3">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add investigation notes (optional)…"
            rows={2}
            className="w-full rounded-lg border px-3 py-2 text-sm resize-none"
            style={{ background: "var(--bg-inset)", borderColor: "var(--border)", color: "var(--text)" }}
          />
          <div className="flex flex-wrap gap-2">
            {FEEDBACK_OPTIONS.map((f) => (
              <Button key={f.type} variant={f.variant} disabled={submitting} onClick={() => submitFeedback(f.type)}>
                {f.label}
              </Button>
            ))}
          </div>

          {(alert.feedback ?? []).length > 0 && (
            <div className="mt-3 pt-3 border-t flex flex-col gap-2" style={{ borderColor: "var(--border)" }}>
              {(alert.feedback ?? []).slice().reverse().map((f) => (
                <div key={f.id} className="text-xs flex items-start gap-2">
                  <span className="font-semibold rounded px-1.5 py-0.5" style={{ background: "var(--bg-inset)" }}>{f.feedback_type.replace(/_/g, " ")}</span>
                  <span style={{ color: "var(--text-muted)" }}>{f.notes || "—"}</span>
                  <span className="ml-auto shrink-0" style={{ color: "var(--text-faint)" }}>{formatDate(f.created_at)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
