import { Bot, Server, User } from "lucide-react";
import { cn } from "cn";
import type {
  ContextVerdict,
  IdentityClass,
  Sensitivity,
  SubjectStatus,
} from "@/lib/fixtures";

/* PRD §5.2: four context chips, and red only where something is genuinely wrong. */
const VERDICT: Record<ContextVerdict, { label: string; className: string }> = {
  authorised: {
    label: "Authorised",
    className: "border-emerald-200 bg-emerald-50 text-emerald-800",
  },
  partial: {
    label: "Partial",
    className: "border-slate-200 bg-slate-100 text-slate-600",
  },
  absent: {
    label: "Absent",
    className: "border-amber-200 bg-amber-50 text-amber-800",
  },
  suspicious: {
    label: "Suspicious",
    className: "border-red-200 bg-red-50 text-red-800",
  },
};

/**
 * A verdict is read many times per page — 14 rows on the queue, one per
 * table row on cohort pages. An icon glued to every instance turns into
 * visual noise at that repetition; the colour and the word already carry
 * the distinction on their own, the way a real ticketing system's status
 * column does.
 */
export function VerdictChip({
  verdict,
  className,
}: {
  verdict: ContextVerdict;
  className?: string;
}) {
  const v = VERDICT[verdict];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm border px-1.5 py-0.5 text-[11px] font-medium whitespace-nowrap",
        v.className,
        className,
      )}
    >
      {v.label}
    </span>
  );
}

const IDENTITY: Record<IdentityClass, { Icon: typeof User; title: string }> = {
  human: { Icon: User, title: "Human identity" },
  service: { Icon: Server, title: "Service identity" },
  agent: { Icon: Bot, title: "Autonomous agent identity" },
};

export function IdentityGlyph({
  identityClass,
}: {
  identityClass: IdentityClass;
}) {
  const { Icon, title } = IDENTITY[identityClass];
  return (
    <span
      title={title}
      className="inline-flex text-slate-500 hover:text-emerald-700 transition-colors"
    >
      <Icon className="size-3.5" aria-hidden />
      <span className="sr-only">{title}</span>
    </span>
  );
}

const STATUS: Record<SubjectStatus, string> = {
  new: "New",
  triaging: "Triaging",
  suppressed: "Suppressed",
  confirmed: "Confirmed",
};

export function StatusChip({ status }: { status: SubjectStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm border px-1.5 py-0.5 text-[11px] font-medium whitespace-nowrap",
        status === "confirmed"
          ? "border-red-200 bg-red-50 text-red-800"
          : status === "suppressed"
            ? "border-emerald-200 bg-emerald-50 text-emerald-800"
            : status === "triaging"
              ? "border-amber-200 bg-amber-50 text-amber-800"
              : "border-slate-200 bg-slate-100 text-slate-600",
      )}
    >
      {STATUS[status]}
    </span>
  );
}

/** Risk band colour. Amber and red are earned, not assigned by default. */
export function riskTone(risk: number): "green" | "amber" | "red" {
  if (risk >= 80) return "red";
  if (risk >= 50) return "amber";
  return "green";
}

const TONE_BG = {
  green: "bg-emerald-100",
  amber: "bg-amber-100",
  red: "bg-red-100",
} as const;

const TONE_TEXT = {
  green: "text-emerald-800",
  amber: "text-amber-800",
  red: "text-red-800",
} as const;

/**
 * A number with a bar behind it (PRD §5.2). `max` lets the expected-cost
 * column share the risk column's scale so the two bars are comparable by eye —
 * which is what makes the sort inversion legible.
 */
export function ValueBar({
  value,
  max = 100,
  display,
  tone,
  className,
}: {
  value: number;
  max?: number;
  display?: string;
  tone?: "green" | "amber" | "red" | "purple";
  className?: string;
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const t = tone ?? riskTone(value);
  return (
    <div
      className={cn(
        "relative h-5.5 w-full min-w-24 overflow-hidden rounded-sm border border-line bg-slate-100",
        className,
      )}
    >
      <div
        className={cn(
          "bar-grow absolute inset-y-0 left-0",
          t === "purple" ? "bg-emerald-100" : TONE_BG[t],
        )}
        style={{ width: `${pct}%` }}
      />
      <span
        className={cn(
          "machine absolute inset-0 flex items-center px-2 text-xs font-semibold tabular-nums",
          t === "purple" ? "text-emerald-800" : TONE_TEXT[t],
        )}
      >
        {display ?? value}
      </span>
    </div>
  );
}

export const SENSITIVITY_COLOR: Record<Sensitivity, string> = {
  low: "var(--tt-grey)",
  medium: "var(--tt-purple)",
  high: "var(--tt-amber)",
  critical: "var(--tt-red)",
};

export function SensitivityDot({ sensitivity }: { sensitivity: Sensitivity }) {
  return (
    <span
      className="inline-block size-2 shrink-0 rounded-full"
      style={{ backgroundColor: SENSITIVITY_COLOR[sensitivity] }}
      title={`${sensitivity} sensitivity`}
    />
  );
}
