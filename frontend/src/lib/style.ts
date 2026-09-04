import type { AlertSeverity, BehavioralState, TimelineLabel } from "../types";

export const STATE_COLOR: Record<BehavioralState, string> = {
  NORMAL: "var(--state-normal)",
  DRIFT: "var(--state-drift)",
  SUSPICIOUS: "var(--state-suspicious)",
  HIGH_RISK: "var(--state-highrisk)",
};

export const STATE_LABEL: Record<BehavioralState, string> = {
  NORMAL: "Normal",
  DRIFT: "Drift",
  SUSPICIOUS: "Suspicious",
  HIGH_RISK: "High Risk",
};

export const SEVERITY_COLOR: Record<AlertSeverity, string> = {
  LOW: "var(--sev-low)",
  MEDIUM: "var(--sev-medium)",
  HIGH: "var(--sev-high)",
  CRITICAL: "var(--sev-critical)",
};

export const SEVERITY_BG: Record<AlertSeverity, string> = {
  LOW: "var(--sev-low-bg)",
  MEDIUM: "var(--sev-medium-bg)",
  HIGH: "var(--sev-high-bg)",
  CRITICAL: "var(--sev-critical-bg)",
};

export const TIMELINE_LABEL_COLOR: Record<TimelineLabel, string> = {
  NORMAL: "var(--text-faint)",
  CONTEXTUAL: "var(--accent)",
  ANOMALOUS: "var(--sev-medium)",
  SUSPICIOUS: "var(--sev-high)",
  HIGH_RISK: "var(--sev-critical)",
};

export function riskToSeverityColor(score: number): string {
  if (score >= 78) return SEVERITY_COLOR.CRITICAL;
  if (score >= 55) return SEVERITY_COLOR.HIGH;
  if (score >= 30) return SEVERITY_COLOR.MEDIUM;
  return SEVERITY_COLOR.LOW;
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export function appLabel(app: string): string {
  return { SOCIAL: "Social", GMAIL: "Gmail", FINANCE: "Finance" }[app] ?? app;
}
