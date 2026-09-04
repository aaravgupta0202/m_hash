import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Card, CardHeader, LoadingState } from "../../components/ui";

interface SettingsResponse {
  disclaimer: string;
  risk_weights: Record<string, number>;
  severity_weight: Record<string, number>;
  state_thresholds: Record<string, [number, number]>;
  alert_severity_thresholds: Record<string, [number, number]>;
  alert_min_score_to_create: number;
  context_discount: Record<string, number>;
  baseline_long_term_days: number;
  baseline_recent_days: number;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsResponse | null>(null);

  useEffect(() => {
    fetch("/api/settings").then((r) => r.json()).then(setSettings);
  }, []);

  if (!settings) return <LoadingState />;

  return (
    <div className="p-6 max-w-[900px] mx-auto flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-semibold">Settings</h1>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>Detection engine configuration — transparent by design.</p>
      </div>

      <Card className="p-4 flex items-start gap-3" style={{ background: "var(--sev-medium-bg)" }}>
        <AlertTriangle size={18} style={{ color: "var(--sev-medium)" }} className="shrink-0 mt-0.5" />
        <p className="text-sm" style={{ color: "var(--text)" }}>{settings.disclaimer}</p>
      </Card>

      <Card>
        <CardHeader title="Risk weights" subtitle="How much each factor contributes to the 0-100 risk score" />
        <div className="px-5 pb-5">
          <KeyValueTable data={settings.risk_weights} />
        </div>
      </Card>

      <Card>
        <CardHeader title="Severity weight" subtitle="Points applied per unit of deviation score, by signal severity" />
        <div className="px-5 pb-5">
          <KeyValueTable data={settings.severity_weight} />
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="Behavioral state thresholds" />
          <div className="px-5 pb-5">
            <RangeTable data={settings.state_thresholds} />
          </div>
        </Card>
        <Card>
          <CardHeader title="Alert severity thresholds" />
          <div className="px-5 pb-5">
            <RangeTable data={settings.alert_severity_thresholds} />
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader title="Context discount factors" subtitle="Fraction of a signal's score retained after a legitimate explanation is found" />
        <div className="px-5 pb-5">
          <KeyValueTable data={settings.context_discount} format={(v) => `${(v * 100).toFixed(0)}% retained`} />
        </div>
      </Card>

      <Card className="p-5 text-sm flex flex-wrap gap-x-8 gap-y-2" style={{ color: "var(--text-muted)" }}>
        <span>Long-term baseline window: <strong style={{ color: "var(--text)" }}>{settings.baseline_long_term_days} days</strong></span>
        <span>Recent baseline window: <strong style={{ color: "var(--text)" }}>{settings.baseline_recent_days} days</strong></span>
        <span>Minimum score to create an alert: <strong style={{ color: "var(--text)" }}>{settings.alert_min_score_to_create}</strong></span>
      </Card>
    </div>
  );
}

function KeyValueTable({ data, format }: { data: Record<string, number>; format?: (v: number) => string }) {
  return (
    <div className="flex flex-col gap-1.5">
      {Object.entries(data).map(([k, v]) => (
        <div key={k} className="flex items-center justify-between text-sm">
          <span style={{ color: "var(--text-muted)" }}>{k.replace(/_/g, " ")}</span>
          <span className="font-mono font-medium">{format ? format(v) : v}</span>
        </div>
      ))}
    </div>
  );
}

function RangeTable({ data }: { data: Record<string, [number, number]> }) {
  return (
    <div className="flex flex-col gap-1.5">
      {Object.entries(data).map(([k, [lo, hi]]) => (
        <div key={k} className="flex items-center justify-between text-sm">
          <span style={{ color: "var(--text-muted)" }}>{k.replace(/_/g, " ")}</span>
          <span className="font-mono font-medium">{lo} – {hi}</span>
        </div>
      ))}
    </div>
  );
}
