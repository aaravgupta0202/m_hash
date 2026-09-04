import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { PlayCircle, Radio, CheckCircle2 } from "lucide-react";
import { api, simulationSocketUrl } from "../../services/api";
import type { AlertItem, RiskExplanation, ScenarioDefinition, UserSummary } from "../../types";
import { Button, Card, CardHeader, StateBadge } from "../../components/ui";
import { appLabel, formatDate, riskToSeverityColor } from "../../lib/style";

interface LiveEvent {
  id: number;
  timestamp: string;
  application: string;
  action: string;
  user_name?: string;
}

export default function Simulations() {
  const [scenarios, setScenarios] = useState<ScenarioDefinition[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [targetUser, setTargetUser] = useState<UserSummary | null>(null);
  const [liveEvents, setLiveEvents] = useState<LiveEvent[]>([]);
  const [result, setResult] = useState<{ risk_score: number; confidence: number; behavioral_state: string; explanation: RiskExplanation; user_id: number } | null>(null);
  const [alert, setAlert] = useState<AlertItem | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    api.scenarios().then((s) => { setScenarios(s); setSelected(s[0]?.name ?? null); });
    return () => wsRef.current?.close();
  }, []);

  const runScenario = async () => {
    if (!selected) return;
    setRunning(true);
    setLiveEvents([]);
    setResult(null);
    setAlert(null);
    setTargetUser(null);

    const run = await api.createSimulation(selected);
    const ws = new WebSocket(simulationSocketUrl(run.id));
    wsRef.current = ws;

    ws.onmessage = (msg) => {
      const data = JSON.parse(msg.data);
      if (data.type === "start") {
        setTargetUser(data.user);
      } else if (data.type === "event") {
        const e = data.event;
        setLiveEvents((prev) => [...prev, { id: e.id, timestamp: e.timestamp, application: e.application, action: e.action }]);
      } else if (data.type === "risk_update") {
        setResult(data);
      } else if (data.type === "alert") {
        setAlert(data.alert);
      } else if (data.type === "done" || data.type === "error") {
        setRunning(false);
        ws.close();
      }
    };
    ws.onerror = () => setRunning(false);

    await api.startSimulation(run.id);
  };

  return (
    <div className="p-6 max-w-[1200px] mx-auto flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-semibold">Simulation Center</h1>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Replay a narrative scenario live and watch events, risk, and alerts update in real time.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {scenarios.map((s) => (
          <button
            key={s.name}
            onClick={() => setSelected(s.name)}
            disabled={running}
            className="text-left rounded-xl border p-4 transition-colors disabled:opacity-50"
            style={{
              borderColor: selected === s.name ? "var(--accent)" : "var(--border)",
              background: selected === s.name ? "var(--accent-soft)" : "var(--bg-elevated)",
            }}
          >
            <div className="text-sm font-semibold mb-1">{s.label}</div>
            <div className="text-xs" style={{ color: "var(--text-muted)" }}>{s.description}</div>
          </button>
        ))}
      </div>

      <div>
        <Button onClick={runScenario} disabled={running || !selected}>
          <span className="flex items-center gap-1.5"><PlayCircle size={15} /> {running ? "Running…" : "Run Simulation"}</span>
        </Button>
      </div>

      {(running || liveEvents.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4 items-start">
          <Card>
            <CardHeader
              title="Live event feed"
              subtitle={targetUser ? `Target: ${targetUser.name} · ${targetUser.role}` : "Waiting for events…"}
              right={running ? <span className="flex items-center gap-1.5 text-xs font-medium" style={{ color: "var(--sev-high)" }}><Radio size={13} className="animate-pulse" /> Live</span> : <CheckCircle2 size={16} style={{ color: "var(--state-normal)" }} />}
            />
            <div className="px-5 pb-5 flex flex-col gap-2 max-h-[420px] overflow-y-auto">
              {liveEvents.length === 0 && <div className="text-sm py-6 text-center" style={{ color: "var(--text-faint)" }}>No events yet.</div>}
              {liveEvents.map((e, i) => (
                <div key={e.id ?? i} className="flex items-center gap-3 text-sm border-l-2 pl-3" style={{ borderColor: "var(--accent)" }}>
                  <span className="text-xs w-16 shrink-0" style={{ color: "var(--text-faint)" }}>{new Date(e.timestamp).toLocaleTimeString()}</span>
                  <span className="font-medium w-16 shrink-0">{appLabel(e.application)}</span>
                  <span style={{ color: "var(--text-muted)" }}>{e.action.replace(/_/g, " ").toLowerCase()}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-4 sticky top-4 flex flex-col gap-4">
            {result && (
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "var(--text-faint)" }}>Resulting risk</div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl font-bold" style={{ color: riskToSeverityColor(result.risk_score) }}>{result.risk_score.toFixed(0)}</span>
                  <StateBadge state={result.behavioral_state as any} />
                </div>
                <ul className="text-xs flex flex-col gap-1">
                  {result.explanation.bullets.slice(0, 5).map((b, i) => <li key={i} style={{ color: "var(--text-muted)" }}>{b}</li>)}
                </ul>
                <Link to={`/security/users/${result.user_id}`} className="text-xs mt-2 inline-block hover:underline" style={{ color: "var(--accent)" }}>
                  View full investigation →
                </Link>
              </div>
            )}
            {alert && (
              <div className="pt-3 border-t" style={{ borderColor: "var(--border)" }}>
                <div className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "var(--text-faint)" }}>Alert generated</div>
                <div className="text-sm font-medium mb-1">{alert.title}</div>
                <div className="text-xs mb-2" style={{ color: "var(--text-faint)" }}>{formatDate(alert.updated_at)}</div>
                <Link to={`/security/alerts/${alert.id}`} className="text-xs hover:underline" style={{ color: "var(--accent)" }}>
                  Open alert →
                </Link>
              </div>
            )}
            {!result && !alert && (
              <div className="text-sm text-center py-6" style={{ color: "var(--text-faint)" }}>Results appear here once the burst finishes.</div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
