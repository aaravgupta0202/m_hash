import type { ActionFeedback } from "../hooks/useActionRecorder";
import { riskToSeverityColor } from "../lib/style";

export default function ActivityToast({ feedback }: { feedback: ActionFeedback | null }) {
  if (!feedback) return null;
  return (
    <div
      className="fixed bottom-5 right-5 rounded-xl border shadow-lg px-4 py-3 text-sm z-50 flex items-center gap-3"
      style={{ background: "var(--bg-elevated)", borderColor: "var(--border)", color: "var(--text)" }}
    >
      <span className="w-2 h-2 rounded-full" style={{ background: riskToSeverityColor(feedback.risk_score) }} />
      <div>
        <div className="font-medium">Security event recorded</div>
        <div className="text-xs" style={{ color: "var(--text-faint)" }}>
          {feedback.action.replace(/_/g, " ").toLowerCase()} · risk {feedback.risk_score.toFixed(0)} · {feedback.behavioral_state.replace("_", " ").toLowerCase()}
        </div>
      </div>
    </div>
  );
}
