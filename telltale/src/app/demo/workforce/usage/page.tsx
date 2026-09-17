import { Clock, Layers, PieChart, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Panel } from "@/components/panel";
import { BrandIcon } from "@/components/brand-icon";
import {
  CategoryDonut,
  categoryColor,
  fmtHours,
} from "@/components/workforce/bits";
import { AppUsageTable } from "@/components/workforce/app-usage-table";
import { HOURLY_TOP_APPLICATION, MEMBERS, MEMBER_DAYS } from "@/lib/fixtures";

export const metadata = { title: "App usage - tellTale" };

/** Aggregated across the org from the same per-member fixtures the day view reads. */
const CATEGORY_TOTALS = Object.entries(
  MEMBER_DAYS.flatMap((d) => d.categoryTime).reduce<Record<string, number>>(
    (acc, c) => {
      acc[c.category] = (acc[c.category] ?? 0) + c.minutes;
      return acc;
    },
    {},
  ),
)
  .map(([category, minutes]) => ({ category, minutes }))
  .sort((a, b) => b.minutes - a.minutes);

const APP_TOTALS = Object.entries(
  MEMBER_DAYS.flatMap((d) => d.applications).reduce<
    Record<string, { minutes: number; category: string; users: Set<string> }>
  >((acc, a) => {
    const row = acc[a.application] ?? {
      minutes: 0,
      category: a.category,
      users: new Set<string>(),
    };
    row.minutes += a.minutes;
    row.users.add(a.windowTitle);
    acc[a.application] = row;
    return acc;
  }, {}),
)
  .map(([application, v]) => ({
    application,
    minutes: v.minutes,
    category: v.category,
    titles: v.users.size,
  }))
  .sort((a, b) => b.minutes - a.minutes);

const HOURLY_MAX = Math.max(...HOURLY_TOP_APPLICATION.map((h) => h.minutes));

export default function UsagePage() {
  const totalMinutes = CATEGORY_TOTALS.reduce((a, c) => a + c.minutes, 0);
  const topApp = APP_TOTALS[0];

  return (
    <>
      <PageHeader
        eyebrow="Workforce module"
        title="Application usage"
        description="Time by category and by application across the organisation, aggregated from the same per-member records the day views show."
      />

      <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Stat
          icon={Clock}
          label="Tracked time"
          value={fmtHours(totalMinutes)}
          sub={`${MEMBERS.length} members, one day`}
        />
        <Stat
          icon={Layers}
          label="Applications seen"
          value={String(APP_TOTALS.length)}
          sub="distinct executables"
        />
        <Stat
          icon={PieChart}
          label="Categories"
          value={String(CATEGORY_TOTALS.length)}
          sub="composition, not classification"
        />
        <Stat
          icon={Sparkles}
          label="Most-used"
          value={topApp.application}
          appIcon={topApp.application}
          sub={`${fmtHours(topApp.minutes)} across the org`}
        />
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 xl:grid-cols-[1fr_1.25fr]">
        <Panel
          title="Time by category"
          sub="Organisation-wide composition for the pinned day."
          footnote="Composition drift is a risk signal in the other module, computed on pseudonymous identities. It is not computed here, and this screen carries no score."
        >
          <CategoryDonut data={CATEGORY_TOTALS} />
        </Panel>

        <Panel
          title="Applications"
          sub="Ordered by recorded duration. Searchable by app name or category."
          bodyClassName="p-0"
        >
          <AppUsageTable items={APP_TOTALS} topMinutes={topApp.minutes} />
        </Panel>
      </div>

      <Panel
        title="Top application by hour"
        sub="The application with the most recorded time in each hour of the working day, and how many members it was open for."
        bodyClassName="p-0"
        footnote="An hour with a high member count and a low minute total is a short shared activity (such as a standup or deploy window). Reading intent into either is a management judgement this screen deliberately does not make."
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-line bg-slate-50">
                {[
                  "Hour",
                  "Application",
                  "Category",
                  "Members",
                  "Recorded time",
                  "",
                ].map((h) => (
                  <th
                    key={h}
                    className="label px-4 py-2 text-left text-slate-500"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {HOURLY_TOP_APPLICATION.map((h) => (
                <tr
                  key={h.hour}
                  className="border-b border-line hover:bg-slate-50 transition-colors"
                >
                  <td className="machine px-4 py-2 text-slate-500">{h.hour}</td>
                  <td className="px-4 py-2 font-medium text-slate-900">
                    <div className="flex items-center gap-2">
                      <BrandIcon name={h.application} className="size-4" />
                      <span>{h.application}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    <span className="flex items-center gap-1.5 text-xs text-slate-700 capitalize">
                      <span
                        className="size-2 rounded-sm"
                        style={{ backgroundColor: categoryColor(h.category) }}
                      />
                      {h.category}
                    </span>
                  </td>
                  <td className="machine px-4 py-2 font-semibold text-slate-900">
                    {h.members}
                  </td>
                  <td className="machine px-4 py-2 text-slate-500">
                    {fmtHours(h.minutes)}
                  </td>
                  <td className="w-40 px-4 py-2">
                    <div className="h-3 w-full rounded bg-slate-100 border border-line overflow-hidden">
                      <div
                        className="bar-grow h-3 rounded"
                        style={{
                          width: `${(h.minutes / HOURLY_MAX) * 100}%`,
                          backgroundColor: categoryColor(h.category),
                        }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  sub,
  appIcon,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub: string;
  appIcon?: string;
}) {
  return (
    <div className="panel px-4 py-3 bg-white border border-line rounded-sm ">
      <div className="flex items-center justify-between">
        <p className="label text-slate-500">{label}</p>
        <Icon className="size-4 text-emerald-600" />
      </div>
      <div className="mt-1.5 flex items-center gap-2">
        {appIcon && <BrandIcon name={appIcon} className="size-6" />}
        <p className="machine truncate text-2xl leading-none font-bold text-slate-900">
          {value}
        </p>
      </div>
      <p className="mt-1.5 text-xs text-slate-500">{sub}</p>
    </div>
  );
}
