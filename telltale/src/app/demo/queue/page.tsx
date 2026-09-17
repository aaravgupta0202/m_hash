import Link from "next/link";
import { ArrowUpRight, Inbox, Clock, Flame, ShieldAlert } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Panel } from "@/components/panel";
import { QueueTable } from "@/components/risk/queue-table";
import {
  QUEUE_ROWS,
  QUEUE_SORT_FOOTNOTE,
  SUPPRESSED_TODAY,
} from "@/lib/fixtures";

export const metadata = { title: "Investigation queue — tellTale" };

export default function QueuePage() {
  const aboveLine = QUEUE_ROWS.filter((r) => r.rank <= 7);
  const topByRisk = [...QUEUE_ROWS].sort((a, b) => b.risk - a.risk)[0];

  return (
    <>
      <PageHeader
        eyebrow="Risk module"
        title="Investigation queue"
        description="Ranked by expected cost of inaction, not by raw risk. Seven items sit inside today's triage capacity; the rest are retained, ranked and visible."
        right={
          <Link
            href="/demo/suppressions"
            className="flex items-center gap-2 rounded-sm border border-emerald-300 bg-emerald-50 px-3.5 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 hover:border-emerald-400 transition-colors"
          >
            {SUPPRESSED_TODAY.toLocaleString("en-US")} suppressed today — view
            log
            <ArrowUpRight className="size-4" />
          </Link>
        }
      />

      <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Stat
          icon={Inbox}
          label="In queue"
          value={String(QUEUE_ROWS.length)}
          sub="after identity aggregation"
        />
        <Stat
          icon={Clock}
          label="Inside capacity"
          value={String(aboveLine.length)}
          sub="6 analyst-hours today"
        />
        <Stat
          icon={Flame}
          label="Highest expected cost"
          value={QUEUE_ROWS[0].pseudonym}
          sub={`${QUEUE_ROWS[0].expectedCost.toFixed(1)} — risk ${QUEUE_ROWS[0].risk}`}
        />
        <Stat
          icon={ShieldAlert}
          label="Highest raw risk"
          value={topByRisk.pseudonym}
          sub={`risk ${topByRisk.risk} — ranks #${topByRisk.rank}`}
        />
      </div>

      <Panel bodyClassName="p-0" footnote={QUEUE_SORT_FOOTNOTE}>
        <QueueTable />
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
