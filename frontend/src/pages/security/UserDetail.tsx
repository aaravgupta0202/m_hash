import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, MapPin, Laptop, FolderKanban, Info } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { api } from "../../services/api";
import type { BaselineResponse, EventItem, HistoryPoint, UserDetail as UserDetailType, UserRiskResponse } from "../../types";
import { Card, CardHeader, LoadingState, StateBadge } from "../../components/ui";
import BehavioralStateTrack from "../../components/BehavioralStateTrack";
import EventTimeline from "../../components/EventTimeline";
import { appLabel, formatDate, riskToSeverityColor } from "../../lib/style";

const APP_COLORS: Record<string, string> = { SOCIAL: "#e1306c", GMAIL: "#d93025", FINANCE: "#1a7f5a" };

function pct(counter: Record<string, number>, key: string): number {
  const total = Object.values(counter).reduce((a, b) => a + b, 0);
  if (total === 0) return 0;
  return ((counter[key] ?? 0) / total) * 100;
}

export default function UserDetail() {
  const { id } = useParams();
  const userId = Number(id);
  const [user, setUser] = useState<UserDetailType | null>(null);
  const [risk, setRisk] = useState<UserRiskResponse | null>(null);
  const [baseline, setBaseline] = useState<BaselineResponse | null>(null);
  const [history, setHistory] = useState<HistoryPoint[] | null>(null);
  const [timeline, setTimeline] = useState<EventItem[] | null>(null);

  useEffect(() => {
    setUser(null); setRisk(null); setBaseline(null); setHistory(null); setTimeline(null);
    api.user(userId).then(setUser);
    api.userRisk(userId).then(setRisk);
    api.userBaseline(userId).then(setBaseline);
    api.userHistory(userId, 14).then(setHistory);
    api.userTimeline(userId, { days: 10, limit: 120 }).then(setTimeline);
  }, [userId]);

  if (!user || !risk) return <LoadingState />;

  const hourData = baseline?.long_term
    ? Array.from({ length: 24 }, (_, h) => ({
        hour: `${h}:00`,
        long_term: baseline.long_term!.hour_histogram[h] ?? 0,
        recent: baseline.recent?.hour_histogram[h] ?? 0,
      }))
    : [];

  const apps = ["SOCIAL", "GMAIL", "FINANCE"];
  const appData = baseline?.long_term
    ? apps.map((a) => ({
        app: appLabel(a),
        long_term: Math.round(pct(baseline.long_term!.app_usage, a)),
        recent: Math.round(pct(baseline.recent?.app_usage ?? {}, a)),
      }))
    : [];

  const historyData = (history ?? []).map((h) => ({
    date: new Date(h.timestamp).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    risk_score: h.risk_score,
  }));

  return (
    <div className="p-6 max-w-[1200px] mx-auto flex flex-col gap-5">
      <Link to="/security/users" className="flex items-center gap-1.5 text-sm w-fit" style={{ color: "var(--text-muted)" }}>
        <ArrowLeft size={14} /> Back to users
      </Link>

      <Card className="p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-lg font-semibold">{user.name}</h1>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>{user.role} · {user.department}</p>
            {user.scenario_tag && (
              <span className="inline-block mt-1.5 text-[10px] font-bold uppercase rounded px-1.5 py-0.5" style={{ background: "var(--accent-soft)", color: "var(--accent)" }}>
                Scenario: {user.scenario_tag.replace(/_/g, " ")}
              </span>
            )}
          </div>
          <div className="text-right shrink-0">
            <div className="text-3xl font-bold" style={{ color: riskToSeverityColor(risk.risk_score) }}>{risk.risk_score.toFixed(0)}</div>
            <div className="text-xs mb-1" style={{ color: "var(--text-faint)" }}>{risk.confidence.toFixed(0)}% confidence</div>
            <StateBadge state={risk.behavioral_state} />
          </div>
        </div>

        <div className="mt-6">
          <BehavioralStateTrack current={risk.behavioral_state} riskScore={risk.risk_score} />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-6 text-xs">
          <div className="flex items-center gap-1.5"><MapPin size={13} style={{ color: "var(--text-faint)" }} /> {user.usual_locations.join(", ")}</div>
          <div className="flex items-center gap-1.5"><Laptop size={13} style={{ color: "var(--text-faint)" }} /> {user.devices.map((d) => d.name).join(", ")}</div>
          <div className="flex items-center gap-1.5"><FolderKanban size={13} style={{ color: "var(--text-faint)" }} /> {user.projects.map((p) => p.name).join(", ") || "No active project"}</div>
        </div>
      </Card>

      {historyData.length > 1 && (
        <Card>
          <CardHeader title="Risk trajectory" subtitle="Behavioral risk score over the last 14 days" />
          <div className="h-40 px-2 pb-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historyData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--text-faint)" }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "var(--text-faint)" }} axisLine={false} tickLine={false} width={36} />
                <Tooltip contentStyle={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="risk_score" stroke={riskToSeverityColor(risk.risk_score)} strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      <Card>
        <CardHeader title="Why suspicious?" subtitle={risk.explanation.headline} right={<Info size={16} style={{ color: "var(--text-faint)" }} />} />
        <div className="px-5 pb-5">
          {risk.explanation.bullets.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--text-faint)" }}>No meaningful behavioral deviation detected.</p>
          ) : (
            <ul className="flex flex-col gap-1.5 text-sm">
              {risk.explanation.bullets.map((b, i) => (
                <li key={i} style={{ color: b.startsWith("~") ? "var(--text-faint)" : "var(--text)" }}>{b}</li>
              ))}
            </ul>
          )}
          {risk.explanation.context.length > 0 && (
            <div className="mt-4 pt-4 border-t text-sm" style={{ borderColor: "var(--border)" }}>
              <div className="font-medium mb-1">Context</div>
              {risk.explanation.context.map((c, i) => <p key={i} style={{ color: "var(--text-muted)" }}>{c}</p>)}
            </div>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="Login hours: baseline vs recent" subtitle="Long-term normal window vs. the last 3 days" />
          <div className="h-48 px-2 pb-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <XAxis dataKey="hour" tick={{ fontSize: 9, fill: "var(--text-faint)" }} axisLine={false} tickLine={false} interval={3} />
                <YAxis tick={{ fontSize: 10, fill: "var(--text-faint)" }} axisLine={false} tickLine={false} width={28} />
                <Tooltip contentStyle={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="long_term" fill="var(--border)" radius={[2, 2, 0, 0]} name="Long-term baseline" />
                <Bar dataKey="recent" fill="var(--accent)" radius={[2, 2, 0, 0]} name="Recent (3d)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader title="Application mix: baseline vs recent" subtitle="Share of activity per application" />
          <div className="h-48 px-2 pb-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={appData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <XAxis dataKey="app" tick={{ fontSize: 11, fill: "var(--text-faint)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "var(--text-faint)" }} axisLine={false} tickLine={false} width={34} unit="%" />
                <Tooltip contentStyle={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="long_term" fill="var(--border)" radius={[2, 2, 0, 0]} name="Long-term %" />
                <Bar dataKey="recent" fill="var(--accent)" radius={[2, 2, 0, 0]} name="Recent %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <div className="text-sm font-semibold mb-3">Applications</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {apps.map((a) => {
            const count = baseline?.recent?.app_usage[a] ?? 0;
            return (
              <div key={a} className="rounded-lg p-3" style={{ background: "var(--bg-inset)" }}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full" style={{ background: APP_COLORS[a] }} />
                  <span className="text-sm font-medium">{appLabel(a)}</span>
                </div>
                <div className="text-xs" style={{ color: "var(--text-faint)" }}>{count} events in the last 3 days</div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-semibold">Behavioral timeline</span>
          <Link to="/security/timeline" className="text-xs hover:underline" style={{ color: "var(--accent)" }}>Full timeline →</Link>
        </div>
        <div className="max-h-[520px] overflow-y-auto pr-1">
          {timeline ? <EventTimeline events={timeline} /> : <LoadingState />}
        </div>
      </Card>

      {user.context_events.length > 0 && (
        <Card className="p-5">
          <div className="text-sm font-semibold mb-3">Context on file</div>
          <div className="flex flex-col gap-2">
            {user.context_events.map((c) => (
              <div key={c.id} className="text-sm flex items-center justify-between">
                <span>{c.description}</span>
                <span className="text-xs" style={{ color: "var(--text-faint)" }}>{formatDate(c.start_date)}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
