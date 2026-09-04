import type { ReactNode } from "react";
import type { AlertSeverity, BehavioralState } from "../types";
import { SEVERITY_BG, SEVERITY_COLOR, STATE_COLOR, STATE_LABEL } from "../lib/style";

export function Card({ children, className = "", style }: { children: ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`rounded-xl border ${className}`}
      style={{ background: "var(--bg-elevated)", borderColor: "var(--border)", ...style }}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, right }: { title: string; subtitle?: string; right?: ReactNode }) {
  return (
    <div className="flex items-start justify-between px-5 pt-4 pb-2">
      <div>
        <h3 className="text-sm font-semibold" style={{ color: "var(--text)" }}>{title}</h3>
        {subtitle && <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}

export function SeverityBadge({ severity }: { severity: AlertSeverity }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-semibold"
      style={{ background: SEVERITY_BG[severity], color: SEVERITY_COLOR[severity] }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: SEVERITY_COLOR[severity] }} />
      {severity}
    </span>
  );
}

export function StateBadge({ state }: { state: BehavioralState }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-semibold"
      style={{ background: `color-mix(in srgb, ${STATE_COLOR[state]} 15%, transparent)`, color: STATE_COLOR[state] }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: STATE_COLOR[state] }} />
      {STATE_LABEL[state]}
    </span>
  );
}

export function StatTile({ label, value, sub, accent }: { label: string; value: ReactNode; sub?: string; accent?: string }) {
  return (
    <Card className="p-4 flex flex-col gap-1">
      <span className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-faint)" }}>{label}</span>
      <span className="text-2xl font-semibold" style={{ color: accent ?? "var(--text)" }}>{value}</span>
      {sub && <span className="text-xs" style={{ color: "var(--text-muted)" }}>{sub}</span>}
    </Card>
  );
}

export function Pill({ children, active, onClick }: { children: ReactNode; active?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="rounded-full px-3 py-1 text-xs font-medium border transition-colors"
      style={{
        background: active ? "var(--accent)" : "var(--bg-inset)",
        color: active ? "#fff" : "var(--text-muted)",
        borderColor: active ? "var(--accent)" : "var(--border)",
      }}
    >
      {children}
    </button>
  );
}

export function Button({
  children, onClick, variant = "primary", disabled, type = "button", className = "",
}: {
  children: ReactNode; onClick?: () => void; variant?: "primary" | "secondary" | "ghost" | "danger";
  disabled?: boolean; type?: "button" | "submit"; className?: string;
}) {
  const styles: Record<string, React.CSSProperties> = {
    primary: { background: "var(--accent)", color: "#fff", borderColor: "var(--accent)" },
    secondary: { background: "var(--bg-inset)", color: "var(--text)", borderColor: "var(--border)" },
    ghost: { background: "transparent", color: "var(--text-muted)", borderColor: "transparent" },
    danger: { background: "var(--sev-critical-bg)", color: "var(--sev-critical)", borderColor: "var(--sev-critical)" },
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-opacity disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-85 ${className}`}
      style={styles[variant]}
    >
      {children}
    </button>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center py-12 text-sm" style={{ color: "var(--text-faint)" }}>
      {message}
    </div>
  );
}

export function LoadingState() {
  return (
    <div className="flex items-center justify-center py-12 text-sm" style={{ color: "var(--text-faint)" }}>
      Loading…
    </div>
  );
}
