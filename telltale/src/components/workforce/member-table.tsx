"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { cn } from "cn";
import { ActivityRibbon, fmtHours } from "@/components/workforce/bits";
import { BrandIcon } from "@/components/brand-icon";
import { ALL_MEMBERS, ALL_TEAMS, useFilters } from "@/lib/filters";
import { MEMBERS } from "@/lib/fixtures";

/**
 * PRD §5.6: per-member working time, idle time, top application, last seen, and
 * a 24-hour activity ribbon.
 *
 * The columns are deliberately boring. There is no score column, no rank, no
 * league table, and the rows are in roster order rather than sorted by hours —
 * sorting a workforce table by working time is how a time-tracking tool becomes
 * a productivity tool (PRD §7.2).
 */
export function MemberTable() {
  const router = useRouter();
  const { team, member } = useFilters();

  const rows = MEMBERS.filter(
    (m) =>
      (team === ALL_TEAMS || m.team === team) &&
      (member === ALL_MEMBERS || m.name === member),
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[980px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-line bg-slate-50">
            {[
              "Member",
              "Team",
              "Working",
              "Idle",
              "Top application",
              "Activity 00:00 → 24:00",
              "Sensor",
              "Last seen",
              "",
            ].map((h) => (
              <th
                key={h}
                className="label px-3 py-2.5 text-left text-slate-500 text-[10px]"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.length === 0 && (
            <tr>
              <td
                colSpan={9}
                className="px-3 py-10 text-center text-sm text-slate-500"
              >
                No member matches this filter. Clear it from the top bar.
              </td>
            </tr>
          )}
          {rows.map((m) => (
            <tr
              key={m.id}
              onClick={() => router.push(`/demo/workforce/${m.id}`)}
              className="group cursor-pointer hover:bg-slate-50/80 transition-colors"
            >
              <td className="px-3 py-2.5">
                <Link
                  href={`/demo/workforce/${m.id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors"
                >
                  {m.name}
                </Link>
                <span className="machine ml-2 text-[10px] text-slate-400">
                  {m.id}
                </span>
              </td>
              <td className="px-3 py-2.5 text-slate-600">{m.team}</td>
              <td className="machine px-3 py-2.5 text-emerald-700 font-semibold">
                {fmtHours(m.workingMinutes)}
              </td>
              <td className="machine px-3 py-2.5 text-slate-500">
                {fmtHours(m.idleMinutes)}
              </td>
              <td className="px-3 py-2.5 text-slate-700">
                <div className="flex items-center gap-1.5">
                  <BrandIcon name={m.topApplication} className="size-4" />
                  <span>{m.topApplication}</span>
                </div>
              </td>
              <td className="px-3 py-2.5">
                <ActivityRibbon ribbon={m.ribbon} />
              </td>
              <td className="px-3 py-2.5">
                <span
                  className={cn(
                    "label rounded-[4px] border px-2 py-0.5 text-[10px] font-semibold",
                    m.sensorEquipped
                      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                      : "border-line bg-slate-100 text-slate-500",
                  )}
                >
                  {m.sensorEquipped ? "Deployed" : "Cloud-only"}
                </span>
              </td>
              <td className="machine px-3 py-2.5 text-xs text-slate-500">
                {m.lastSeen.slice(11, 16)}
              </td>
              <td className="px-3 py-2.5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all">
                <ArrowRight className="size-3.5" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
