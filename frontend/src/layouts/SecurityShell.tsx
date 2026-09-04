import {
  AlertTriangle, Users, GitBranch, List, PlayCircle, Settings, ShieldCheck,
  LayoutDashboard, ExternalLink,
} from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";

const NAV = [
  { to: "/security/overview", label: "Overview", icon: LayoutDashboard },
  { to: "/security/alerts", label: "Alerts", icon: AlertTriangle },
  { to: "/security/users", label: "Users", icon: Users },
  { to: "/security/timeline", label: "Timeline", icon: GitBranch },
  { to: "/security/events", label: "Events", icon: List },
  { to: "/security/simulations", label: "Simulations", icon: PlayCircle },
  { to: "/security/settings", label: "Settings", icon: Settings },
];

const MOCK_APPS = [
  { to: "/apps/social", label: "Social" },
  { to: "/apps/gmail", label: "Gmail" },
  { to: "/apps/finance", label: "Finance" },
];

export default function SecurityShell() {
  return (
    <div className="flex min-h-screen" style={{ background: "var(--bg)", color: "var(--text)" }}>
      <aside
        className="w-60 shrink-0 flex flex-col border-r"
        style={{ borderColor: "var(--border)", background: "var(--bg-elevated)" }}
      >
        <div className="flex items-center gap-2 px-5 h-16 border-b" style={{ borderColor: "var(--border)" }}>
          <ShieldCheck size={20} style={{ color: "var(--accent)" }} />
          <div>
            <div className="text-sm font-semibold leading-tight">Silent Shift</div>
            <div className="text-[11px] leading-tight" style={{ color: "var(--text-faint)" }}>Security Behavior Center</div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isActive ? "" : "hover:opacity-80"}`
              }
              style={({ isActive }) => ({
                background: isActive ? "var(--accent-soft)" : "transparent",
                color: isActive ? "var(--accent)" : "var(--text-muted)",
              })}
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 py-4 border-t" style={{ borderColor: "var(--border)" }}>
          <div className="text-[11px] font-semibold uppercase tracking-wide px-3 mb-2" style={{ color: "var(--text-faint)" }}>
            Mock Applications
          </div>
          {MOCK_APPS.map((a) => (
            <a
              key={a.to}
              href={a.to}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between rounded-lg px-3 py-2 text-sm hover:opacity-80"
              style={{ color: "var(--text-muted)" }}
            >
              {a.label}
              <ExternalLink size={13} />
            </a>
          ))}
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  );
}
