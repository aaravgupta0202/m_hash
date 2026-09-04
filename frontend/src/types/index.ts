export type BehavioralState = "NORMAL" | "DRIFT" | "SUSPICIOUS" | "HIGH_RISK";
export type AlertSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type AlertStatus =
  | "OPEN"
  | "ACKNOWLEDGED"
  | "MARKED_BENIGN"
  | "MARKED_EXPECTED"
  | "MARKED_SUSPICIOUS"
  | "CONFIRMED_INCIDENT";
export type Application = "SOCIAL" | "GMAIL" | "FINANCE";
export type TimelineLabel = "NORMAL" | "CONTEXTUAL" | "ANOMALOUS" | "SUSPICIOUS" | "HIGH_RISK";

export interface UserSummary {
  id: number;
  name: string;
  email: string;
  role: string;
  department: string;
  current_risk_score: number;
  current_confidence: number;
  current_state: BehavioralState;
  state_updated_at: string | null;
  is_scenario_actor: boolean;
  scenario_tag: string | null;
}

export interface UserDetail extends UserSummary {
  normal_start_hour: number;
  normal_end_hour: number;
  usual_locations: string[];
  devices: { id: number; name: string; type: string; first_seen: string; is_known: boolean }[];
  projects: { name: string; assigned_at: string }[];
  context_events: {
    id: number;
    context_type: string;
    description: string;
    start_date: string;
    end_date: string | null;
  }[];
}

export interface EventItem {
  id: number;
  timestamp: string;
  user_id: number;
  user_name: string;
  application: Application;
  event_type: string;
  action: string;
  resource_id: string | null;
  resource_type: string | null;
  resource_sensitivity: string;
  device_label: string | null;
  ip_address: string | null;
  location: string | null;
  session_id: string | null;
  data_volume: number;
  metadata: Record<string, unknown>;
  project_id: number | null;
  label?: TimelineLabel;
  signal_reasons?: string[];
}

export interface SignalDto {
  signal_type: string;
  severity: AlertSeverity;
  reason: string;
  application: string | null;
  raw_score: number;
  effective_score: number;
  contextualized: boolean;
  context_note: string | null;
}

export interface RiskExplanation {
  headline: string;
  bullets: string[];
  context: string[];
}

export interface UserRiskResponse {
  user_id: number;
  as_of: string;
  risk_score: number;
  confidence: number;
  behavioral_state: BehavioralState;
  explanation: RiskExplanation;
  context_notes: string[];
  correlation: {
    distinct_signal_types: number;
    distinct_applications: string[];
    span_days: number;
    cross_app_bonus: number;
    burst_bonus: number;
    persistence_bonus: number;
  };
  signals: SignalDto[];
}

export interface BaselineSnapshot {
  baseline_type: string;
  computed_at: string;
  window_start: string;
  window_end: string;
  normal_hour_start: number;
  normal_hour_end: number;
  hour_histogram: number[];
  usual_locations: Record<string, number>;
  usual_devices: Record<string, number>;
  app_usage: Record<string, number>;
  resource_categories: Record<string, number>;
  action_frequencies: Record<string, number>;
  avg_events_per_day: number;
  avg_data_volume_per_day: number;
  sample_size: number;
}

export interface BaselineResponse {
  long_term: BaselineSnapshot | null;
  recent: BaselineSnapshot | null;
}

export interface AlertEvidenceItem {
  id: number;
  signal_type: string;
  description: string;
  severity: AlertSeverity;
  deviation_score: number;
  application: string | null;
  event_id: number | null;
  occurred_at: string;
}

export interface AnalystFeedbackItem {
  id: number;
  feedback_type: string;
  notes: string;
  analyst_name: string;
  created_at: string;
}

export interface AlertItem {
  id: number;
  user_id: number;
  user_name: string;
  role: string;
  risk_score: number;
  confidence: number;
  severity: AlertSeverity;
  status: AlertStatus;
  behavioral_state: BehavioralState;
  title: string;
  summary: string;
  first_observed: string;
  last_observed: string;
  affected_applications: string[];
  affected_resources: string[];
  context_notes: string[];
  created_at: string;
  updated_at: string;
  evidence?: AlertEvidenceItem[];
  feedback?: AnalystFeedbackItem[];
}

export interface OverviewResponse {
  total_users: number;
  monitored_events: number;
  active_alerts: number;
  high_risk_users: number;
  behavioral_shifts: number;
  risk_distribution: Record<AlertSeverity, number>;
  risk_trend: { date: string; avg_risk: number }[];
  top_risk_users: UserSummary[];
  recent_shifts: AlertItem[];
}

export interface ScenarioDefinition {
  name: string;
  label: string;
  description: string;
}

export interface HistoryPoint {
  timestamp: string;
  state: BehavioralState;
  risk_score: number;
  confidence: number;
}

export interface SimulationRun {
  id: number;
  scenario_name: string;
  status: "PENDING" | "RUNNING" | "COMPLETED" | "FAILED";
  started_at: string | null;
  completed_at: string | null;
  total_events: number;
  events_emitted: number;
}
