import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Panel } from "@/components/panel";
import { QueueTable } from "@/components/risk/queue-table";
import { QUEUE_ROWS, QUEUE_SORT_FOOTNOTE, SUPPRESSED_TODAY } from "@/lib/fixtures";

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
            href="/suppressions"
            className="flex items-center gap-1.5 rounded-sm border border-line bg-purple-lt px-3 py-2 text-sm font-medium text-purple hover:bg-purple/10"
          >
            {SUPPRESSED_TODAY.toLocaleString("en-US")} suppressed today — view log
            <ArrowUpRight className="size-3.5" />
          </Link>
        }
      />

      <div className="mb-4 grid grid-cols-4 gap-4">
        <Stat label="In queue" value={String(QUEUE_ROWS.length)} sub="after identity aggregation" />
        <Stat label="Inside capacity" value={String(aboveLine.length)} sub="6 analyst-hours today" />
        <Stat
          label="Highest expected cost"
          value={QUEUE_ROWS[0].pseudonym}
          sub={`${QUEUE_ROWS[0].expectedCost.toFixed(1)} — risk ${QUEUE_ROWS[0].risk}`}
        />
        <Stat
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

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="panel px-4 py-3">
      <p className="label text-grey">{label}</p>
      <p className="machine mt-1 text-2xl leading-none font-semibold text-purple">{value}</p>
      <p className="mt-1.5 text-xs text-grey">{sub}</p>
    </div>
  );
}
