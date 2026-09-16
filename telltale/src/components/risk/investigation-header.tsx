import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "cn";
import { Field } from "@/components/panel";
import { IdentityGlyph, VerdictChip, riskTone } from "@/components/risk/chips";
import { ActionButtons } from "@/components/risk/action-buttons";
import type { Dossier, Subject } from "@/lib/fixtures";

const TONE_TEXT = { green: "text-green", amber: "text-amber", red: "text-red" } as const;

const VERDICT_LABEL_TONE: Record<string, string> = {
  CRITICAL: "border-red/40 bg-red/8 text-red",
  HIGH: "border-amber/40 bg-amber/8 text-amber",
  ELEVATED: "border-amber/40 bg-amber/8 text-amber",
  SUPPRESSED: "border-green/40 bg-green/8 text-green",
  MONITORING: "border-line bg-purple-lt text-grey",
};

/** PRD §5.3A. No employee name appears here, or anywhere in this module (§7.1). */
export function InvestigationHeader({ subject, dossier }: { subject: Subject; dossier: Dossier }) {
  const tone = riskTone(dossier.risk);
  return (
    <div className="mb-4">
      <Link
        href="/queue"
        className="mb-3 inline-flex items-center gap-1.5 text-xs text-grey hover:text-purple"
      >
        <ArrowLeft className="size-3.5" />
        Investigation queue
      </Link>

      <div className="panel flex items-stretch">
        <div className="flex w-56 shrink-0 flex-col justify-center border-r border-line px-5 py-4">
          <p className="label text-grey">Calibrated risk</p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className={cn("machine text-5xl leading-none font-semibold", TONE_TEXT[tone])}>
              {dossier.risk}
            </span>
            <span className="machine text-sm text-grey">/100</span>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span
              className={cn(
                "label inline-flex rounded-sm border px-1.5 py-0.5",
                VERDICT_LABEL_TONE[dossier.verdictLabel] ?? VERDICT_LABEL_TONE.MONITORING,
              )}
            >
              {dossier.verdictLabel}
            </span>
            <VerdictChip verdict={subject.verdict} />
          </div>
          <p className="machine mt-2 text-xs text-grey">
            P = {dossier.probability.toFixed(2)} · logit {dossier.logitTotal >= 0 ? "+" : "−"}
            {Math.abs(dossier.logitTotal).toFixed(2)}
          </p>
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-between gap-3 px-5 py-4">
          <div>
            <div className="flex items-center gap-2">
              <IdentityGlyph identityClass={subject.identityClass} />
              <h1 className="machine text-2xl leading-none font-semibold text-purple">{subject.pseudonym}</h1>
              <span className="label rounded-sm border border-line px-1.5 py-0.5 text-grey">
                {subject.identityClass}
              </span>
              {!subject.sensorEquipped && (
                <span className="label rounded-sm border border-line bg-purple-lt px-1.5 py-0.5 text-grey">
                  Cloud-only
                </span>
              )}
            </div>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink">{dossier.headline}</p>
          </div>

          <div className="grid grid-cols-[1.7fr_repeat(4,1fr)] gap-4 border-t border-line pt-3">
            <Field label="Cohort">{subject.cohort}</Field>
            <Field label="Cohort size" mono>
              {subject.cohortSize}
            </Field>
            <Field label="Tenure" mono>
              {subject.tenureDays}d
            </Field>
            <Field label="Expected cost" mono>
              {subject.expectedCost.toFixed(1)}
            </Field>
            <Field label="Sensor">{subject.sensorEquipped ? "Deployed" : "Not deployed"}</Field>
          </div>
        </div>

        <div className="flex w-52 shrink-0 flex-col justify-between border-l border-line px-4 py-4">
          <div>
            <p className="label mb-2 text-grey">Response</p>
            <ActionButtons pseudonym={subject.pseudonym} />
          </div>
          <p className="mt-3 text-[11px] leading-relaxed text-grey">
            Each action explains what it would do. None is wired to a connector in this build.
          </p>
        </div>
      </div>
    </div>
  );
}
