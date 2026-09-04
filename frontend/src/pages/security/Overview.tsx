import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AlertTriangle, Users, Activity, TrendingUp } from "lucide-react";
import { api } from "../../services/api";
import type { OverviewResponse } from "../../types";
import { Card, CardHeader, LoadingState, SeverityBadge, StateBadge, StatTile } from "../../components/ui";
import { SEVERITY_COLOR, formatDate } from "../../lib/style";

export default function Overview() {
  const [data, setData] = useState<OverviewResponse | null>(null);

  useEffect(() => {
    api.overview().then(setData);
    const interval = setInterval(() => api.overview().then(setData), 15000);
    return () => clearInterval(interval);
  }, []);

  if (!data) return <LoadingState />;

  const severities: (keyof typeof data.risk_distribution)[] = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];
  const maxSeverityCount = Math.max(1, ...severities.map((s) => data.risk_distribution[s] ?? 0));

  return (
    <div className="p-6 max-w-[1400px] mx-auto flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Overview</h1>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Behavioral posture across Social, Gmail, and Finance — monitored through one unified event pipeline.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatTile label="Monitored Users" value={data.total_users} sub="across 7 roles" />
        <StatTile label="Events Ingested" value={data.monitored_events.toLocaleString()} sub="unified schema" />
        <StatTile label="Active Alerts" value={data.active_alerts} accent="var(--sev-high)" />
        <StatTile label="High-Risk Users" value={data.high_risk_users} accent="var(--sev-critical)" sub={`${data.behavioral_shifts} showing behavioral shift`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader title="Organization risk trend" subtitle="Average behavioral risk score across all users, last 7 days" right={<TrendingUp size={16} style={{ color: "var(--text-faint)" }} />} />
          <div className="h-56 px-2 pb-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.risk_trend} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--text-faint)" }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "var(--text-faint)" }} axisLine={false} tickLine={false} width={36} />
                <Tooltip
                  contentStyle={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: "var(--text)" }}
                />
                <Area type="monotone" dataKey="avg_risk" stroke="var(--accent)" strokeWidth={2} fill="url(#riskGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader title="Risk distribution" subtitle="Open alerts by severity" right={<AlertTriangle size={16} style={{ color: "var(--text-faint)" }} />} />
          <div className="px-5 pb-5 flex flex-col gap-3">
            {severities.map((sev) => (
              <div key={sev} className="flex items-center gap-3">
                <span className="w-16 text-xs font-semibold" style={{ color: SEVERITY_COLOR[sev] }}>{sev}</span>
                <div className="flex-1 h-2 rounded-full" style={{ background: "var(--bg-inset)" }}>
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${((data.risk_distribution[sev] ?? 0) / maxSeverityCount) * 100}%`,
                      background: SEVERITY_COLOR[sev],
                    }}
                  />
                </div>
                <span className="w-5 text-right text-xs font-semibold">{data.risk_distribution[sev] ?? 0}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="Top risk users" subtitle="Ranked by current behavioral risk score" right={<Users size={16} style={{ color: "var(--text-faint)" }} />} />
          <div className="px-2 pb-3">
            {data.top_risk_users.map((u) => (
              <Link
                key={u.id}
                to={`/security/users/${u.id}`}
                className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg hover:opacity-80 transition-opacity"
              >
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{u.name}</div>
                  <div className="text-xs" style={{ color: "var(--text-faint)" }}>{u.role} · {u.department}</div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <StateBadge state={u.current_state} />
                  <span className="text-sm font-semibold w-9 text-right">{u.current_risk_score.toFixed(0)}</span>
                </div>
              </Link>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="Recent behavioral shifts" subtitle="Latest alert activity" right={<Activity size={16} style={{ color: "var(--text-faint)" }} />} />
          <div className="px-2 pb-3">
            {data.recent_shifts.length === 0 && (
              <div className="px-3 py-6 text-sm text-center" style={{ color: "var(--text-faint)" }}>No alerts yet.</div>
            )}
            {data.recent_shifts.map((a) => (
              <Link
                key={a.id}
                to={`/security/alerts/${a.id}`}
                className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg hover:opacity-80 transition-opacity"
              >
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{a.title}</div>
                  <div className="text-xs" style={{ color: "var(--text-faint)" }}>{formatDate(a.updated_at)}</div>
                </div>
                <SeverityBadge severity={a.severity} />
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
