import { notFound } from "next/navigation";
import { Panel } from "@/components/panel";
import { AttackPath } from "@/components/risk/attack-path";
import { CohortStrip } from "@/components/risk/cohort-strip";
import { CompositeTimelineChart } from "@/components/risk/composite-timeline";
import { ContextChecks } from "@/components/risk/context-checks";
import { ContributionTable } from "@/components/risk/contribution-table";
import { EvidenceList } from "@/components/risk/evidence-list";
import { InvestigationHeader } from "@/components/risk/investigation-header";
import {
  ALL_DOSSIERS,
  dossierFor,
  routeIdFor,
  subjectById,
  timelineFor,
} from "@/lib/fixtures";

/** Every queue row plus the suppressed subject has a real page (PRD §6). */
export function generateStaticParams() {
  return ALL_DOSSIERS.map((d) => ({ id: routeIdFor(d.subjectId) }));
}

export async function generateMetadata(props: PageProps<"/demo/subject/[id]">) {
  const { id } = await props.params;
  return { title: `#${id} — investigation — tellTale` };
}

export default async function SubjectPage(props: PageProps<"/demo/subject/[id]">) {
  const { id } = await props.params;
  const subjectId = `subject_${id}`;
  const dossier = dossierFor(subjectId);
  const subject = subjectById(subjectId);
  const timeline = timelineFor(subjectId);
  if (!dossier || !subject || !timeline) notFound();

  return (
    <>
      <InvestigationHeader subject={subject} dossier={dossier} />

      <div className="flex flex-col gap-4">
        <Panel
          title="Composite timeline"
          sub="Authentication, actions, authorising records and the calibrated score on one hour axis. The lanes share a single scale, so vertical alignment is a statement about the same moment in time."
          bodyClassName="p-0"
          footnote="Every tick is an event the connectors reported. The CONTEXT lane is the only lane that can be empty while the others are busy, and that combination is the finding."
        >
          <CompositeTimelineChart timeline={timeline} />
        </Panel>

        <Panel
          title="Why it scored"
          sub="Additive contributions to the log-odds. The column sums to the logit; the logit maps through the logistic to the calibrated probability. There is no post-hoc attribution step — the explanation is the model."
          bodyClassName="p-0"
          footnote={
            dossier.sensorNote ??
            "Every row names the evidence it was derived from. A feature with no deviation contributes exactly zero and is shown rather than hidden, because an analyst needs to know it was tested."
          }
        >
          <ContributionTable
            contributions={dossier.contributions}
            logitTotal={dossier.logitTotal}
            probability={dossier.probability}
            risk={dossier.risk}
          />
        </Panel>

        <Panel
          title="Context verification"
          sub="Four tests against the operational record that would authorise this activity. A record is not accepted because it exists — it is accepted because it passes."
          bodyClassName="p-0"
        >
          <ContextChecks checks={dossier.checks} verdict={subject.verdict} />
        </Panel>

        <Panel
          title="Attack path"
          sub="The trajectory as a graph. Edge labels are empirical transition probabilities measured in this organisation, not global priors."
          bodyClassName="p-0"
        >
          <AttackPath
            nodes={dossier.attackPath.nodes}
            edges={dossier.attackPath.edges}
          />
        </Panel>

        <Panel
          title="Cohort comparison"
          sub="The subject against peers doing the same work, on the metric the volumetric detector uses. The shaded band is one MAD-unit either side of the cohort median, so the Z-score in the table above is a visible distance rather than a claim."
          bodyClassName="p-0"
        >
          <CohortStrip comparison={dossier.comparison} />
        </Panel>

        <Panel
          title="Evidence"
          sub="Collected artefacts, tagged and flagged by the analyst. Metadata only — no message bodies, no file contents, no typed text."
          bodyClassName="p-0"
        >
          <EvidenceList items={dossier.evidence} />
        </Panel>
      </div>
    </>
  );
}
