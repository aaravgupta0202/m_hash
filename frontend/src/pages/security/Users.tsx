import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../services/api";
import type { UserSummary } from "../../types";
import { Card, LoadingState, Pill, StateBadge } from "../../components/ui";
import { riskToSeverityColor } from "../../lib/style";

export default function Users() {
  const [users, setUsers] = useState<UserSummary[] | null>(null);
  const [query, setQuery] = useState("");
  const [stateFilter, setStateFilter] = useState<string | null>(null);

  useEffect(() => { api.users().then(setUsers); }, []);

  const filtered = useMemo(() => {
    if (!users) return [];
    return users.filter((u) => {
      if (stateFilter && u.current_state !== stateFilter) return false;
      if (query && !`${u.name} ${u.role} ${u.department}`.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [users, query, stateFilter]);

  return (
    <div className="p-6 max-w-[1400px] mx-auto flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-semibold">Users</h1>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>18 monitored identities across the organization.</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, role, or department…"
          className="rounded-lg border px-3 py-1.5 text-sm w-64"
          style={{ background: "var(--bg-inset)", borderColor: "var(--border)", color: "var(--text)" }}
        />
        <Pill active={stateFilter === null} onClick={() => setStateFilter(null)}>All</Pill>
        {["NORMAL", "DRIFT", "SUSPICIOUS", "HIGH_RISK"].map((s) => (
          <Pill key={s} active={stateFilter === s} onClick={() => setStateFilter(s)}>{s.replace("_", " ")}</Pill>
        ))}
      </div>

      <Card>
        {!users && <LoadingState />}
        {users && (
          <div className="divide-y" style={{ borderColor: "var(--border)" }}>
            <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-5 py-2 text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--text-faint)" }}>
              <span>User</span>
              <span className="w-32">State</span>
              <span className="w-16 text-right">Risk</span>
              <span className="w-20 text-right">Confidence</span>
            </div>
            {filtered.map((u) => (
              <Link
                key={u.id}
                to={`/security/users/${u.id}`}
                className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 px-5 py-3 hover:opacity-80 transition-opacity"
              >
                <div className="min-w-0 flex items-center gap-2">
                  <span
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
                    style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
                  >
                    {u.name.split(" ").map((p) => p[0]).join("").slice(0, 2)}
                  </span>
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{u.name}</div>
                    <div className="text-xs truncate" style={{ color: "var(--text-faint)" }}>{u.role} · {u.department}</div>
                  </div>
                </div>
                <div className="w-32"><StateBadge state={u.current_state} /></div>
                <div className="w-16 text-right text-sm font-semibold" style={{ color: riskToSeverityColor(u.current_risk_score) }}>
                  {u.current_risk_score.toFixed(0)}
                </div>
                <div className="w-20 text-right text-xs" style={{ color: "var(--text-faint)" }}>{u.current_confidence.toFixed(0)}%</div>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
