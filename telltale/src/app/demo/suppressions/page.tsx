import { ShieldCheck, ListFilter, AlertCircle, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Panel } from "@/components/panel";
import { SuppressionTable } from "@/components/risk/suppression-table";
import {
  RAISED_ANOMALIES,
  SUPPRESSED_BY_CONTEXT,
  SUPPRESSIONS,
} from "@/lib/fixtures";

export const metadata = { title: "Approved activity - tellTale" };

export default function SuppressionsPage() {
  const underReview = SUPPRESSIONS.filter((s) => s.underReview).length;
  const pct = Math.round((SUPPRESSED_BY_CONTEXT / RAISED_ANOMALIES) * 100);

  return (
    <>
      <PageHeader
        eyebrow="Security module"
        title="Approved, not discarded."
        description="Every anomaly explained away by context is retained with the record that explained it, who created that record, and when. Full auditability for every automated approval."
      />

      <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Stat
          icon={ShieldCheck}
          label="Approved today"
          value={SUPPRESSED_BY_CONTEXT.toLocaleString("en-US")}
          sub={`${pct}% of ${RAISED_ANOMALIES.toLocaleString("en-US")} raised`}
        />
        <Stat
          icon={ListFilter}
          label="Shown here"
          value={String(SUPPRESSIONS.length)}
          sub="most recent, all reason codes"
        />
        <Stat
          icon={AlertCircle}
          label="Under review"
          value={String(underReview)}
          sub="reopened by the context detector"
        />
        <Stat
          icon={Trash2}
          label="Deleted"
          value="0"
          sub="suppression is reversible by design"
        />
      </div>

      <Panel
        bodyClassName="p-0"
        footnote="Retention here makes every automatic approval checkable. A reviewer can take any suppressed anomaly, read the record that approved it, and disagree: which keeps the system fully accountable."
      >
        <SuppressionTable />
      </Panel>
    </>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="panel px-4 py-3 bg-white border border-line rounded-sm ">
      <div className="flex items-center justify-between">
        <p className="label text-slate-500">{label}</p>
        <Icon className="size-4 text-emerald-600" />
      </div>
      <p className="machine mt-1.5 truncate text-2xl leading-none font-bold text-slate-900">
        {value}
      </p>
      <p className="mt-1.5 text-xs text-slate-500">{sub}</p>
    </div>
  );
}
