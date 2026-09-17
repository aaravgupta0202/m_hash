import Link from "next/link";
import { ArrowLeft, ShieldAlert, Cpu } from "lucide-react";
import { cn } from "cn";
import { Field } from "@/components/panel";
import { IdentityGlyph, VerdictChip, riskTone } from "@/components/risk/chips";
import { ActionButtons } from "@/components/risk/action-buttons";
import type { Dossier, Subject } from "@/lib/fixtures";

const TONE_TEXT = {
  green: "text-emerald-700",
  amber: "text-amber-700",
  red: "text-red-700",
} as const;

const VERDICT_LABEL_TONE: Record<string, string> = {
  CRITICAL: "border-red-200 bg-red-50 text-red-800 font-bold",
  HIGH: "border-amber-200 bg-amber-50 text-amber-800 font-bold",
  ELEVATED: "border-amber-200 bg-amber-50 text-amber-800 font-semibold",
  SUPPRESSED: "border-emerald-200 bg-emerald-50 text-emerald-800 font-bold",
  MONITORING: "border-slate-200 bg-slate-100 text-slate-700",
};

/** PRD §5.3A. No employee name appears here, or anywhere in this module (§7.1). */
export function InvestigationHeader({
  subject,
  dossier,
}: {
  subject: Subject;
  dossier: Dossier;
}) {
  const tone = riskTone(dossier.risk);
  return (
    <div className="mb-4">
      <Link
        href="/demo/queue"
        className="mb-3 inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-emerald-700 transition-colors"
      >
        <ArrowLeft className="size-3.5" />
        <span>Back to alerts</span>
      </Link>

      <div className="panel flex flex-col lg:flex-row items-stretch border border-line bg-white rounded-sm overflow-hidden ">
        {/* Calibrated Risk Block */}
        <div className="flex w-full lg:w-60 shrink-0 flex-col justify-center border-b lg:border-b-0 lg:border-r border-line bg-slate-50/50 px-5 py-4">
          <p className="label text-slate-500 text-[10px]">
            Calibrated risk score
          </p>
          <div className="mt-1 flex items-baseline gap-2">
            <span
              className={cn(
                "machine text-5xl leading-none font-extrabold tracking-tight",
                TONE_TEXT[tone],
              )}
            >
              {dossier.risk}
            </span>
            <span className="machine text-sm text-slate-400 font-normal">
              /100
            </span>
          </div>
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            <span
              className={cn(
                "label inline-flex rounded border px-2 py-0.5 text-[10px] tracking-wider",
                VERDICT_LABEL_TONE[dossier.verdictLabel] ??
                  VERDICT_LABEL_TONE.MONITORING,
              )}
            >
              {dossier.verdictLabel}
            </span>
            <VerdictChip verdict={subject.verdict} />
          </div>
          <p className="machine mt-2.5 text-xs text-slate-500">
            P = {dossier.probability.toFixed(2)} · logit{" "}
            {dossier.logitTotal >= 0 ? "+" : "−"}
            {Math.abs(dossier.logitTotal).toFixed(2)}
          </p>
        </div>

        {/* Identity & Trajectory Summary */}
        <div className="flex min-w-0 flex-1 flex-col justify-between gap-3 px-5 py-4">
          <div>
            <div className="flex items-center gap-2.5">
              <IdentityGlyph identityClass={subject.identityClass} />
              <h1 className="machine text-2xl leading-none font-bold text-slate-900 tracking-tight">
                {subject.pseudonym}
              </h1>
              <span className="label rounded border border-line bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                {subject.identityClass}
              </span>
              {!subject.sensorEquipped ? (
                <span className="label rounded border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                  Cloud-only
                </span>
              ) : (
                <span className="label rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 flex items-center gap-1">
                  <Cpu className="size-2.5 text-emerald-600" />
                  Sensor
                </span>
              )}
            </div>
            <p className="mt-2.5 max-w-3xl text-sm leading-relaxed text-slate-700">
              {dossier.headline}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-[1.7fr_repeat(4,1fr)] gap-4 border-t border-line pt-3">
            <Field label="Cohort">{subject.cohort}</Field>
            <Field label="Cohort size" mono>
              {subject.cohortSize}
            </Field>
            <Field label="Tenure" mono>
              {subject.tenureDays}d
            </Field>
            <Field label="Priority score" mono>
              {subject.expectedCost.toFixed(1)}
            </Field>
            <Field label="Sensor">
              {subject.sensorEquipped ? "Deployed" : "Not deployed"}
            </Field>
          </div>
        </div>

        {/* Action Panel */}
        <div className="flex w-full lg:w-56 shrink-0 flex-col justify-between border-t lg:border-t-0 lg:border-l border-line bg-slate-50/40 px-4 py-4">
          <div>
            <p className="label mb-2 text-emerald-800 text-[10px] flex items-center gap-1 font-bold">
              <ShieldAlert className="size-3 text-emerald-600" />
              Containment Actions
            </p>
            <ActionButtons pseudonym={subject.pseudonym} />
          </div>
          <p className="mt-2 text-[10px] leading-relaxed text-slate-500">
            Each action explains simulated workflow. No live connectors called
            in demo.
          </p>
        </div>
      </div>
    </div>
  );
}
