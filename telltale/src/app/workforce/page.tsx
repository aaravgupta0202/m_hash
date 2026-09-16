import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { Panel } from "@/components/panel";
import { RibbonLegend, fmtHours } from "@/components/workforce/bits";
import { MemberTable } from "@/components/workforce/member-table";
import { CAPTURES, CONNECTORS, MEMBERS } from "@/lib/fixtures";

export const metadata = { title: "Workforce — tellTale" };

export default function WorkforcePage() {
  const sensor = MEMBERS.filter((m) => m.sensorEquipped).length;
  const coverage = Math.round((sensor / MEMBERS.length) * 100);
  const active = CONNECTORS.filter((c) => c.state === "healthy").length;
  const totalWorking = MEMBERS.reduce((a, m) => a + m.workingMinutes, 0);

  return (
    <>
      <PageHeader
        eyebrow="Workforce module"
        title="Org summary"
        description="Working time, activity and coverage for named employees. This module carries no risk scores and no link to the risk module — crossing between them is the dual-custody unmasking flow, not a navigation."
      />

      <div className="mb-4 grid grid-cols-4 gap-4">
        <Stat label="People monitored" value={String(MEMBERS.length)} sub="with notice, on company devices" />
        <Stat label="Sensor coverage" value={`${coverage}%`} sub={`${sensor} of ${MEMBERS.length} endpoints enrolled`} />
        <Stat label="Captures today" value={String(CAPTURES.length)} sub="scheduled and triggered" />
        <Stat label="Active connectors" value={`${active} / ${CONNECTORS.length}`} sub="feeding this module" />
      </div>

      <Panel
        title="Members"
        sub={`${MEMBERS.length} people, ${fmtHours(totalWorking)} of working time recorded on the pinned day. Roster order — not ranked.`}
        right={<RibbonLegend />}
        bodyClassName="p-0"
        className="mb-4"
        footnote="Working and idle time come from endpoint input activity, not from application choice. Nothing here classifies an application as productive or unproductive, and no member is compared against another."
      >
        <MemberTable />
      </Panel>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Panel title="What this module is for">
          <p className="text-sm leading-relaxed text-ink">
            Workforce reporting answers operational questions — who was working, on what, for how long, and
            with what coverage. It is named, because a working-time record that cannot be attributed is not a
            working-time record.
          </p>
          <p className="mt-2.5 text-sm leading-relaxed text-grey">
            The risk module answers a different question and uses a different identity space. It is
            pseudonymous, and it never sees this screen. That separation is the product, not a setting:
            behavioural risk analysis does not need to know who anyone is until a human being decides it
            does, and that decision takes two approvals.
          </p>
        </Panel>

        <Panel title="Where to go next">
          <ul className="space-y-2.5">
            {[
              { href: "/workforce/usage", label: "Application usage", sub: "Category and application breakdown, hourly top application" },
              { href: "/workforce/captures", label: "Screen captures", sub: "Generated placeholder gallery with tag and flag" },
              { href: `/workforce/${MEMBERS[0].id}`, label: "A member day view", sub: "Timeline, hours by slot, time by category, captures" },
            ].map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="block rounded-sm border border-line px-3 py-2.5 hover:bg-purple-lt/60">
                  <p className="text-sm font-medium text-purple">{l.label} →</p>
                  <p className="mt-0.5 text-xs text-grey">{l.sub}</p>
                </Link>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
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
