import type {
  AlertItem,
  BaselineResponse,
  EventItem,
  HistoryPoint,
  OverviewResponse,
  ScenarioDefinition,
  SimulationRun,
  UserDetail,
  UserRiskResponse,
  UserSummary,
} from "../types";

const BASE = "/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`${res.status} ${path}: ${text}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  get: (path: string) => request<any>(path),
  put: (path: string, body: any) => request<any>(path, { method: "PUT", body: JSON.stringify(body) }),
  post: (path: string, body?: any) => request<any>(path, { method: "POST", body: body ? JSON.stringify(body) : undefined }),

  overview: () => request<OverviewResponse>("/overview"),

  users: () => request<UserSummary[]>("/users"),
  user: (id: number) => request<UserDetail>(`/users/${id}`),
  userRisk: (id: number) => request<UserRiskResponse>(`/users/${id}/risk`),
  userBaseline: (id: number) => request<BaselineResponse>(`/users/${id}/baseline`),
  userHistory: (id: number, days = 14) => request<HistoryPoint[]>(`/users/${id}/history?days=${days}`),
  userTimeline: (
    id: number,
    params: { application?: string; event_type?: string; severity?: string; days?: number; limit?: number } = {}
  ) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => v !== undefined && v !== "" && qs.set(k, String(v)));
    const suffix = qs.toString() ? `?${qs.toString()}` : "";
    return request<EventItem[]>(`/users/${id}/timeline${suffix}`);
  },

  events: (params: { user_id?: number; application?: string; days?: number; limit?: number } = {}) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => v !== undefined && qs.set(k, String(v)));
    const suffix = qs.toString() ? `?${qs.toString()}` : "";
    return request<EventItem[]>(`/events${suffix}`);
  },

  alerts: (params: { severity?: string; status?: string; user_id?: number } = {}) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => v !== undefined && qs.set(k, String(v)));
    const suffix = qs.toString() ? `?${qs.toString()}` : "";
    return request<AlertItem[]>(`/alerts${suffix}`);
  },
  alert: (id: number) => request<AlertItem>(`/alerts/${id}`),
  alertFeedback: (id: number, body: { feedback_type: string; notes?: string; analyst_name?: string }) =>
    request<AlertItem>(`/alerts/${id}/feedback`, { method: "POST", body: JSON.stringify(body) }),

  scenarios: () => request<ScenarioDefinition[]>("/simulations/scenarios"),
  simulationRuns: () => request<SimulationRun[]>("/simulations"),
  createSimulation: (scenario_name: string, target_user_id?: number) =>
    request<SimulationRun>("/simulations", { method: "POST", body: JSON.stringify({ scenario_name, target_user_id }) }),
  startSimulation: (id: number) => request<{ status: string; run_id: number }>(`/simulations/${id}/run`, { method: "POST" }),

  appEvent: (
    application: "social" | "gmail" | "finance",
    body: {
      user_id: number;
      event_type: string;
      action: string;
      resource_id?: string;
      resource_type?: string;
      resource_sensitivity?: string;
      device_name?: string;
      location?: string;
      data_volume?: number;
      metadata?: Record<string, unknown>;
    }
  ) => request<{ event: EventItem; risk_score: number; confidence: number; behavioral_state: string }>(
    `/apps/${application}/event`,
    { method: "POST", body: JSON.stringify(body) }
  ),
};

export function simulationSocketUrl(runId: number): string {
  const proto = window.location.protocol === "https:" ? "wss" : "ws";
  return `${proto}://${window.location.host}/api/simulations/${runId}/ws`;
}
