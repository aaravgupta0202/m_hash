import { useCallback, useState } from "react";
import { api } from "../services/api";
import { useCurrentUser } from "./CurrentUserContext";
import { useSession } from "./SessionContext";

export interface ActionFeedback {
  risk_score: number;
  confidence: number;
  behavioral_state: string;
  action: string;
}

/** Every meaningful click in a mock app funnels through here, which calls
 * the unified event-ingestion endpoint and surfaces the resulting live risk
 * so the app itself never needs to know anything about detection. */
export function useActionRecorder(application: "social" | "gmail" | "finance") {
  const { currentUserId, refreshUsers } = useCurrentUser();
  const session = useSession();
  const [feedback, setFeedback] = useState<ActionFeedback | null>(null);

  const record = useCallback(
    async (params: {
      event_type: string;
      action: string;
      resource_id?: string;
      resource_type?: string;
      resource_sensitivity?: string;
      device_name?: string;
      location?: string;
      data_volume?: number;
      metadata?: Record<string, unknown>;
    }) => {
      // Session device/location haven't loaded yet - recording now would fall
      // back to an empty value and could misrepresent this as an anomaly.
      if (!currentUserId || !session.ready) return;
      const res = await api.appEvent(application, {
        user_id: currentUserId,
        device_name: session.device,
        location: session.location,
        ...params,
      });
      setFeedback({ risk_score: res.risk_score, confidence: res.confidence, behavioral_state: res.behavioral_state, action: params.action });
      refreshUsers();
      window.setTimeout(() => setFeedback((f) => (f?.action === params.action ? null : f)), 4000);
    },
    [application, currentUserId, refreshUsers, session.ready, session.device, session.location]
  );

  return { record, feedback };
}
