import { PageHeader } from "@/components/page-header";
import { Panel } from "@/components/panel";
import { SuppressionTable } from "@/components/risk/suppression-table";
import { RAISED_ANOMALIES, SUPPRESSED_BY_CONTEXT, SUPPRESSIONS } from "@/lib/fixtures";

export const metadata = { title: "Suppression log — tellTale" };

export default function SuppressionsPage() {
  const underReview = SUPPRESSIONS.filter((s) => s.underReview).length;
  const pct = Math.round((SUPPRESSED_BY_CONTEXT / RAISED_ANOMALIES) * 100);

  return (
    <>
      <PageHeader
        eyebrow="Risk module"
        title="Suppressed, not discarded."
        description="Every anomaly context explained away is retained with the record that explained it, who created that record, and when. A suppression nobody can audit is indistinguishable from a detection that never fired."
      />

      <div className="mb-4 grid grid-cols-4 gap-4">
        <Stat label="Suppressed today" value={SUPPRESSED_BY_CONTEXT.toLocaleString("en-US")} sub={`${pct}% of ${RAISED_ANOMALIES.toLocaleString("en-US")} raised`} />
        <Stat label="Shown here" value={String(SUPPRESSIONS.length)} sub="most recent, all reason codes" />
        <Stat label="Under review" value={String(underReview)} sub="reopened by the context detector" />
        <Stat label="Deleted" value="0" sub="suppression is reversible by design" />
      </div>

      <Panel
        bodyClassName="p-0"
        footnote="Retention here is what makes the 84% claim checkable. A reviewer can take any suppressed anomaly, read the record that suppressed it, and disagree — which is the difference between a filter and an argument."
      >
        <SuppressionTable />
      </Panel>
    </>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="panel px-4 py-3">
      <p className="label text-grey">{label}</p>
      <p className="machine mt-1 text-2xl leading-none font-semibold text-purple">{value}</p>
      <p className="mt-1.5 text-xs text-grey">{sub}</p>
    </div>
  );
}
