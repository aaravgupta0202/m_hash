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
  return { title: `#${id} - Case Details - tellTale` };
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
          title="Activity timeline"
          sub="Authentication, actions, and authorising records plotted on a single hour axis for clear chronological correlation."
          bodyClassName="p-0"
          footnote="Every tick is an event reported by connected tools. The CONTEXT lane shows whether an authorizing ticket existed at that moment."
        >
          <CompositeTimelineChart timeline={timeline} />
        </Panel>

        <Panel
          title="Why it scored"
          sub="Clear breakdown of factors contributing to the score: each factor adds or subtracts from the overall total with full transparency."
          bodyClassName="p-0"
          footnote={
            dossier.sensorNote ??
            "Every row names the evidence it was derived from. A factor with no deviation contributes zero and is shown for transparency."
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
          sub="Automated tests against the work ticket: a record is accepted only when author, timing, and scope all match."
          bodyClassName="p-0"
        >
          <ContextChecks checks={dossier.checks} verdict={subject.verdict} />
        </Panel>

        <Panel
          title="Action path"
          sub="Sequence of actions visualized as steps between systems, measuring transition frequency across the team."
          bodyClassName="p-0"
        >
          <AttackPath
            nodes={dossier.attackPath.nodes}
            edges={dossier.attackPath.edges}
          />
        </Panel>

        <Panel
          title="Cohort comparison"
          sub="Subject activity compared against team peers doing the same job, identifying whether volume is normal or an outlier."
          bodyClassName="p-0"
        >
          <CohortStrip comparison={dossier.comparison} />
        </Panel>

        <Panel
          title="Evidence list"
          sub="Collected metadata artefacts, tagged and flagged by analysts (metadata only: no message bodies or raw file contents)."
          bodyClassName="p-0"
        >
          <EvidenceList items={dossier.evidence} />
        </Panel>
      </div>
    </>
  );
}
