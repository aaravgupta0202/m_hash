import { PageHeader } from "@/components/page-header";
import { Panel } from "@/components/panel";
import { CategoryDonut, categoryColor, fmtHours } from "@/components/workforce/bits";
import { HOURLY_TOP_APPLICATION, MEMBERS, MEMBER_DAYS } from "@/lib/fixtures";

export const metadata = { title: "Application usage — tellTale" };

/** Aggregated across the org from the same per-member fixtures the day view reads. */
const CATEGORY_TOTALS = Object.entries(
  MEMBER_DAYS.flatMap((d) => d.categoryTime).reduce<Record<string, number>>((acc, c) => {
    acc[c.category] = (acc[c.category] ?? 0) + c.minutes;
    return acc;
  }, {}),
)
  .map(([category, minutes]) => ({ category, minutes }))
  .sort((a, b) => b.minutes - a.minutes);

const APP_TOTALS = Object.entries(
  MEMBER_DAYS.flatMap((d) => d.applications).reduce<Record<string, { minutes: number; category: string; users: Set<string> }>>(
    (acc, a) => {
      const row = acc[a.application] ?? { minutes: 0, category: a.category, users: new Set<string>() };
      row.minutes += a.minutes;
      row.users.add(a.windowTitle);
      acc[a.application] = row;
      return acc;
    },
    {},
  ),
)
  .map(([application, v]) => ({ application, minutes: v.minutes, category: v.category, titles: v.users.size }))
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

      <div className="mb-4 grid grid-cols-4 gap-4">
        <Stat label="Tracked time" value={fmtHours(totalMinutes)} sub={`${MEMBERS.length} members, one day`} />
        <Stat label="Applications seen" value={String(APP_TOTALS.length)} sub="distinct executables" />
        <Stat label="Categories" value={String(CATEGORY_TOTALS.length)} sub="composition, not classification" />
        <Stat label="Most-used" value={topApp.application} sub={`${fmtHours(topApp.minutes)} across the org`} />
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
          sub="Ordered by recorded duration. Window-title counts are distinct titles seen, which is metadata."
          bodyClassName="p-0"
        >
          <div className="max-h-96 overflow-y-auto">
            <table className="w-full border-collapse text-sm">
              <thead className="sticky top-0 bg-white">
                <tr className="border-b border-line">
                  {["Application", "Category", "Titles", "Duration", ""].map((h) => (
                    <th key={h} className="label px-4 py-2 text-left text-grey">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {APP_TOTALS.map((a) => (
                  <tr key={a.application} className="border-b border-line/70">
                    <td className="px-4 py-1.5 font-medium text-ink">{a.application}</td>
                    <td className="px-4 py-1.5">
                      <span className="flex items-center gap-1.5 text-xs text-ink capitalize">
                        <span className="size-2 rounded-sm" style={{ backgroundColor: categoryColor(a.category) }} />
                        {a.category}
                      </span>
                    </td>
                    <td className="machine px-4 py-1.5 text-xs text-grey">{a.titles}</td>
                    <td className="machine px-4 py-1.5 text-ink">{fmtHours(a.minutes)}</td>
                    <td className="w-32 px-4 py-1.5">
                      <div className="h-3 w-full rounded-sm bg-purple-lt">
                        <div
                          className="bar-grow h-3 rounded-sm"
                          style={{
                            width: `${(a.minutes / topApp.minutes) * 100}%`,
                            backgroundColor: categoryColor(a.category),
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
      </div>

      <Panel
        title="Top application by hour"
        sub="The application with the most recorded time in each hour of the working day, and how many members it was open for."
        bodyClassName="p-0"
        footnote="An hour with a high member count and a low minute total is a short shared activity — a standup, a deploy window. Reading intent into either is a management judgement this screen deliberately does not make."
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-line">
                {["Hour", "Application", "Category", "Members", "Recorded time", ""].map((h) => (
                  <th key={h} className="label px-4 py-2 text-left text-grey">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {HOURLY_TOP_APPLICATION.map((h) => (
                <tr key={h.hour} className="border-b border-line/70">
                  <td className="machine px-4 py-1.5 text-grey">{h.hour}</td>
                  <td className="px-4 py-1.5 font-medium text-ink">{h.application}</td>
                  <td className="px-4 py-1.5">
                    <span className="flex items-center gap-1.5 text-xs text-ink capitalize">
                      <span className="size-2 rounded-sm" style={{ backgroundColor: categoryColor(h.category) }} />
                      {h.category}
                    </span>
                  </td>
                  <td className="machine px-4 py-1.5 text-ink">{h.members}</td>
                  <td className="machine px-4 py-1.5 text-grey">{fmtHours(h.minutes)}</td>
                  <td className="w-40 px-4 py-1.5">
                    <div className="h-3 w-full rounded-sm bg-purple-lt">
                      <div
                        className="bar-grow h-3 rounded-sm bg-purple/40"
                        style={{ width: `${(h.minutes / HOURLY_MAX) * 100}%` }}
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

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="panel px-4 py-3">
      <p className="label text-grey">{label}</p>
      <p className="machine mt-1 truncate text-2xl leading-none font-semibold text-purple">{value}</p>
      <p className="mt-1.5 text-xs text-grey">{sub}</p>
    </div>
  );
}
