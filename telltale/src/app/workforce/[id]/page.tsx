import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Field, Panel } from "@/components/panel";
import { BrandIcon } from "@/components/brand-icon";
import {
  ActivityRibbon,
  CategoryDonut,
  RibbonLegend,
  categoryColor,
  fmtHours,
} from "@/components/workforce/bits";
import { CaptureThumb } from "@/components/workforce/capture-thumb";
import { CAPTURES, MEMBERS, memberById, memberDayById } from "@/lib/fixtures";

export function generateStaticParams() {
  return MEMBERS.map((m) => ({ id: m.id }));
}

export async function generateMetadata(props: PageProps<"/workforce/[id]">) {
  const { id } = await props.params;
  const member = memberById(id);
  return { title: `${member?.name ?? id} — workforce — tellTale` };
}

export default async function MemberPage(props: PageProps<"/workforce/[id]">) {
  const { id } = await props.params;
  const member = memberById(id);
  const day = memberDayById(id);
  if (!member || !day) notFound();

  const captures = CAPTURES.filter((c) => c.memberId === id);
  const maxSlot = Math.max(
    ...day.hourSlots.map((s) => s.workingMinutes + s.idleMinutes),
    60,
  );

  return (
    <>
      <Link
        href="/workforce"
        className="mb-3 inline-flex items-center gap-1.5 rounded-sm border border-line bg-white px-2.5 py-1 text-xs text-slate-600 hover:text-emerald-700 hover:bg-slate-50 hover:border-emerald-300 transition-all"
      >
        <ArrowLeft className="size-3.5 text-emerald-600" />
        Org summary
      </Link>

      <div className="panel mb-4 px-5 py-4 bg-white border border-line rounded-sm">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              {member.name}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {member.team} ·{" "}
              <span className="machine text-xs text-emerald-700 font-semibold">
                {member.id}
              </span>
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            <Field label="Working" mono>
              {fmtHours(member.workingMinutes)}
            </Field>
            <Field label="Idle" mono>
              {fmtHours(member.idleMinutes)}
            </Field>
            <Field label="Top application">
              <span className="flex items-center gap-1.5">
                <BrandIcon name={member.topApplication} className="size-4" />
                <span>{member.topApplication}</span>
              </span>
            </Field>
            <Field label="Last seen" mono>
              {member.lastSeen.slice(11, 16)} UTC
            </Field>
          </div>
        </div>

        <div className="mt-4 border-t border-line pt-3">
          <div className="mb-2 flex items-center justify-between">
            <p className="label text-slate-500">Activity across the day</p>
            <RibbonLegend />
          </div>
          <ActivityRibbon ribbon={member.ribbon} showHours />
        </div>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 xl:grid-cols-[1fr_1.1fr]">
        <Panel
          title="Time by category"
          sub="Where input activity fell, by application category."
          footnote="Categories describe composition, not merit. No category is labelled productive or unproductive, and no score is computed from this breakdown."
        >
          <CategoryDonut data={day.categoryTime} />
        </Panel>

        <Panel title="Working and idle by hour" bodyClassName="p-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-line bg-slate-50">
                  {["Hour", "Working", "Idle", "Distribution"].map((h) => (
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
                {day.hourSlots.map((s) => (
                  <tr
                    key={s.hour}
                    className="border-b border-line hover:bg-slate-50 transition-colors"
                  >
                    <td className="machine px-4 py-1.5 text-slate-500">
                      {s.hour}
                    </td>
                    <td className="machine px-4 py-1.5 font-semibold text-emerald-700">
                      {s.workingMinutes}m
                    </td>
                    <td className="machine px-4 py-1.5 text-slate-500">
                      {s.idleMinutes}m
                    </td>
                    <td className="px-4 py-1.5">
                      <div className="flex h-3 w-full min-w-32 gap-px overflow-hidden rounded bg-slate-100 border border-line">
                        <div
                          className="bar-grow bg-emerald-600"
                          style={{
                            width: `${(s.workingMinutes / maxSlot) * 100}%`,
                          }}
                        />
                        <div
                          className="bar-grow bg-slate-300"
                          style={{
                            width: `${(s.idleMinutes / maxSlot) * 100}%`,
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
        title="Applications and window titles"
        sub="The nine longest-running windows of the day. Window titles are metadata — no message body, file content or typed text is collected or shown."
        bodyClassName="p-0"
        className="mb-4"
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-line bg-slate-50">
                {[
                  "Application",
                  "Window title",
                  "Category",
                  "Duration",
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
              {day.applications.map((a, i) => (
                <tr
                  key={i}
                  className="border-b border-line hover:bg-slate-50 transition-colors"
                >
                  <td className="px-4 py-2 font-medium text-slate-900">
                    <div className="flex items-center gap-2">
                      <BrandIcon name={a.application} className="size-4" />
                      <span>{a.application}</span>
                    </div>
                  </td>
                  <td className="machine px-4 py-2 text-xs text-slate-500">
                    {a.windowTitle}
                  </td>
                  <td className="px-4 py-2">
                    <span className="flex items-center gap-1.5 text-xs text-slate-700 capitalize">
                      <span
                        className="size-2 rounded-sm"
                        style={{ backgroundColor: categoryColor(a.category) }}
                      />
                      {a.category}
                    </span>
                  </td>
                  <td className="machine px-4 py-2 font-semibold text-emerald-700">
                    {fmtHours(a.minutes)}
                  </td>
                  <td className="w-40 px-4 py-2">
                    <div className="h-3 w-full rounded bg-slate-100 border border-line overflow-hidden">
                      <div
                        className="bar-grow h-3 rounded"
                        style={{
                          width: `${(a.minutes / day.applications[0].minutes) * 100}%`,
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

      <Panel
        title="Captures"
        sub={`${captures.length} on the pinned day. Thumbnails are generated placeholders — never an image of a real screen.`}
        right={
          <Link
            href="/workforce/captures"
            className="text-xs text-emerald-400 hover:text-emerald-300 hover:underline"
          >
            Full gallery →
          </Link>
        }
      >
        {captures.length === 0 ? (
          <p className="text-sm text-grey">
            No capture on this day. This endpoint is cloud-only, so scheduled
            capture is not available.
          </p>
        ) : (
          <div className="grid grid-cols-6 gap-3">
            {captures.map((c) => (
              <figure key={c.id}>
                <CaptureThumb seed={c.seed} />
                <figcaption className="mt-1.5">
                  <p className="machine text-[11px] text-ink">
                    {c.ts.slice(11, 16)}
                  </p>
                  <p className="truncate text-[11px] text-grey">
                    {c.application}
                  </p>
                  <p className="label mt-0.5 text-grey">{c.mode}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </Panel>
    </>
  );
}
