import { ShieldCheck } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { useCurrentUser } from "../hooks/CurrentUserContext";
import { SessionProvider, useSession } from "../hooks/SessionContext";

const APPS = [
  { to: "/apps/social", label: "Social", color: "#e1306c" },
  { to: "/apps/gmail", label: "Gmail", color: "#d93025" },
  { to: "/apps/finance", label: "Finance", color: "#1a7f5a" },
];

export default function AppShell() {
  const { users, currentUserId, setCurrentUserId, currentUser } = useCurrentUser();

  return (
    <SessionProvider>
      <div className="min-h-screen flex flex-col" style={{ background: "var(--bg)", color: "var(--text)" }}>
        <header
          className="h-14 flex items-center justify-between px-5 border-b shrink-0"
          style={{ borderColor: "var(--border)", background: "var(--bg-elevated)" }}
        >
          <div className="flex items-center gap-5">
            <a href="/security/overview" className="flex items-center gap-2 text-xs font-medium" style={{ color: "var(--text-muted)" }}>
              <ShieldCheck size={16} style={{ color: "var(--accent)" }} />
              Security Center
            </a>
            <div className="w-px h-5" style={{ background: "var(--border)" }} />
            <nav className="flex items-center gap-1">
              {APPS.map((a) => (
                <NavLink
                  key={a.to}
                  to={a.to}
                  className="rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors"
                  style={({ isActive }) => ({
                    background: isActive ? a.color : "transparent",
                    color: isActive ? "#fff" : "var(--text-muted)",
                  })}
                >
                  {a.label}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs" style={{ color: "var(--text-faint)" }}>Signed in as</span>
            <select
              className="text-sm rounded-lg border px-2 py-1"
              style={{ background: "var(--bg-inset)", borderColor: "var(--border)", color: "var(--text)" }}
              value={currentUserId ?? ""}
              onChange={(e) => setCurrentUserId(Number(e.target.value))}
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.name} · {u.role}</option>
              ))}
            </select>
            {currentUser && currentUser.current_state !== "NORMAL" && (
              <span
                className="text-[10px] font-bold uppercase rounded px-1.5 py-0.5"
                style={{ background: "var(--sev-critical-bg)", color: "var(--sev-critical)" }}
                title="This account currently has elevated behavioral risk in the Security Center"
              >
                {currentUser.current_state.replace("_", " ")}
              </span>
            )}
          </div>
        </header>

        <SessionBar />

        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </SessionProvider>
  );
}

function SessionBar() {
  const { knownDevices, knownLocations, device, location, setDevice, setLocation } = useSession();
  return (
    <div
      className="flex items-center gap-4 px-5 py-2 border-b text-xs shrink-0"
      style={{ borderColor: "var(--border)", background: "var(--bg-inset)", color: "var(--text-faint)" }}
    >
      <span className="font-medium uppercase tracking-wide">Session</span>
      <label className="flex items-center gap-1.5">
        Device
        <select
          className="rounded border px-1.5 py-0.5"
          style={{ background: "var(--bg-elevated)", borderColor: "var(--border)", color: "var(--text)" }}
          value={device}
          onChange={(e) => setDevice(e.target.value)}
        >
          {knownDevices.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      </label>
      <label className="flex items-center gap-1.5">
        Location
        <select
          className="rounded border px-1.5 py-0.5"
          style={{ background: "var(--bg-elevated)", borderColor: "var(--border)", color: "var(--text)" }}
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        >
          {knownLocations.map((l) => <option key={l} value={l}>{l}</option>)}
        </select>
      </label>
      <span className="ml-auto italic">Change these to simulate a new device or unusual location for this session.</span>
    </div>
  );
}
