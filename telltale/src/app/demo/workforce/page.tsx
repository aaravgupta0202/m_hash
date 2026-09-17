import Link from "next/link";
import {
  Users,
  Cpu,
  Camera,
  Radio,
  ArrowRight,
  BarChart3,
  Layout,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Panel } from "@/components/panel";
import { RibbonLegend, fmtHours } from "@/components/workforce/bits";
import { MemberTable } from "@/components/workforce/member-table";
import { CAPTURES, CONNECTORS, MEMBERS } from "@/lib/fixtures";

export const metadata = { title: "Team overview - tellTale" };

export default function WorkforcePage() {
  const sensor = MEMBERS.filter((m) => m.sensorEquipped).length;
  const coverage = Math.round((sensor / MEMBERS.length) * 100);
  const active = CONNECTORS.filter((c) => c.state === "healthy").length;
  const totalWorking = MEMBERS.reduce((a, m) => a + m.workingMinutes, 0);

  return (
    <>
      <PageHeader
        eyebrow="Workforce module"
        title="Team overview"
        description="Working time, activity and coverage for named team members. This module carries no security scores and is kept strictly separated from alerts."
      />

      <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat
          icon={Users}
          label="People monitored"
          value={String(MEMBERS.length)}
          sub="with notice, on company devices"
        />
        <Stat
          icon={Cpu}
          label="Sensor coverage"
          value={`${coverage}%`}
          sub={`${sensor} of ${MEMBERS.length} endpoints enrolled`}
        />
        <Stat
          icon={Camera}
          label="Captures today"
          value={String(CAPTURES.length)}
          sub="scheduled and triggered"
        />
        <Stat
          icon={Radio}
          label="Active connectors"
          value={`${active} / ${CONNECTORS.length}`}
          sub="feeding this module"
        />
      </div>

      <Panel
        title="Members"
        sub={`${MEMBERS.length} people, ${fmtHours(totalWorking)} of working time recorded on the pinned day. Roster order (not ranked).`}
        right={<RibbonLegend />}
        bodyClassName="p-0"
        className="mb-4"
        footnote="Working and idle time come from endpoint input activity, not from application choice. Nothing here classifies an application as productive or unproductive, and no member is compared against another."
      >
        <MemberTable />
      </Panel>

      <div className="grid grid-cols-1">
        <Panel title="Where to go next">
          <ul className="space-y-2.5">
            {[
              {
                href: "/demo/workforce/usage",
                label: "App usage",
                sub: "Category and application breakdown, hourly top application",
                icon: BarChart3,
              },
              {
                href: "/demo/workforce/captures",
                label: "Screen captures",
                sub: "Generated placeholder gallery with search and sort",
                icon: Camera,
              },
              {
                href: `/demo/workforce/${MEMBERS[0].id}`,
                label: "Member day view",
                sub: "Timeline, hours by slot, time by category, captures",
                icon: Layout,
              },
            ].map((l) => {
              const Icon = l.icon;
              return (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="flex items-center justify-between rounded-sm border border-line bg-white px-3.5 py-2.5 hover:bg-emerald-50/50 hover:border-emerald-300 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex size-7 items-center justify-center rounded border border-emerald-200 bg-emerald-50 text-emerald-700">
                        <Icon className="size-3.5" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors">
                          {l.label}
                        </p>
                        <p className="mt-0.5 text-[11px] text-slate-500">
                          {l.sub}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="size-3.5 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </Panel>
      </div>
    </>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: typeof Users;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="panel border border-line bg-white px-4 py-3.5 rounded-sm ">
      <div className="flex items-center justify-between">
        <p className="label text-slate-500 text-[10px]">{label}</p>
        <Icon className="size-4 text-emerald-600" />
      </div>
      <p className="machine mt-1.5 text-2xl leading-none font-bold text-slate-900 tracking-tight">
        {value}
      </p>
      <p className="mt-2 text-xs text-slate-500">{sub}</p>
    </div>
  );
}
