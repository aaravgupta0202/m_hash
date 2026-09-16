import { Bot, Server, User } from "lucide-react";
import { cn } from "cn";
import type { ContextVerdict, IdentityClass, Sensitivity, SubjectStatus } from "@/lib/fixtures";

/* PRD §5.2: four context chips, and red only where something is genuinely wrong. */
const VERDICT: Record<ContextVerdict, { label: string; className: string }> = {
  authorised: { label: "AUTHORISED", className: "border-green/40 bg-green/8 text-green" },
  partial: { label: "PARTIAL", className: "border-line bg-purple-lt text-grey" },
  absent: { label: "ABSENT", className: "border-amber/40 bg-amber/8 text-amber" },
  suspicious: { label: "SUSPICIOUS", className: "border-red/40 bg-red/8 text-red" },
};

export function VerdictChip({ verdict, className }: { verdict: ContextVerdict; className?: string }) {
  const v = VERDICT[verdict];
  return (
    <span
      className={cn(
        "label inline-flex items-center rounded-sm border px-1.5 py-0.5 whitespace-nowrap",
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

export function IdentityGlyph({ identityClass }: { identityClass: IdentityClass }) {
  const { Icon, title } = IDENTITY[identityClass];
  return (
    <span title={title} className="inline-flex text-grey">
      <Icon className="size-3.5" aria-hidden />
      <span className="sr-only">{title}</span>
    </span>
  );
}

const STATUS: Record<SubjectStatus, string> = {
  new: "NEW",
  triaging: "TRIAGING",
  suppressed: "SUPPRESSED",
  confirmed: "CONFIRMED",
};

export function StatusChip({ status }: { status: SubjectStatus }) {
  return (
    <span
      className={cn(
        "label inline-flex items-center rounded-sm border px-1.5 py-0.5 whitespace-nowrap",
        status === "confirmed"
          ? "border-red/40 bg-red/8 text-red"
          : status === "suppressed"
            ? "border-green/40 bg-green/8 text-green"
            : status === "triaging"
              ? "border-purple/30 bg-purple-lt text-purple"
              : "border-line bg-white text-grey",
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

const TONE_BG = { green: "bg-green", amber: "bg-amber", red: "bg-red" } as const;
const TONE_TEXT = { green: "text-green", amber: "text-amber", red: "text-red" } as const;

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
    <div className={cn("relative h-5 w-full min-w-24 overflow-hidden rounded-sm bg-purple-lt", className)}>
      <div
        className={cn("bar-grow absolute inset-y-0 left-0", t === "purple" ? "bg-purple/25" : TONE_BG[t])}
        style={{ width: `${pct}%`, opacity: t === "purple" ? 1 : 0.18 }}
      />
      <span
        className={cn(
          "machine absolute inset-0 flex items-center px-1.5 text-xs font-medium",
          t === "purple" ? "text-purple" : TONE_TEXT[t],
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
