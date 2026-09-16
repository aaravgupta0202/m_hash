"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { cn } from "cn";
import { ActivityRibbon, fmtHours } from "@/components/workforce/bits";
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
    (m) => (team === ALL_TEAMS || m.team === team) && (member === ALL_MEMBERS || m.name === member),
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[980px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-line">
            {["Member", "Team", "Working", "Idle", "Top application", "Activity 00:00 → 24:00", "Sensor", "Last seen", ""].map(
              (h) => (
                <th key={h} className="label px-3 py-2 text-left text-grey">
                  {h}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={9} className="px-3 py-8 text-center text-sm text-grey">
                No member matches this filter. Clear it from the top bar.
              </td>
            </tr>
          )}
          {rows.map((m) => (
            <tr
              key={m.id}
              onClick={() => router.push(`/workforce/${m.id}`)}
              className="cursor-pointer border-b border-line/70 hover:bg-purple-lt/50"
            >
              <td className="px-3 py-2">
                <Link
                  href={`/workforce/${m.id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="font-medium text-purple hover:underline"
                >
                  {m.name}
                </Link>
                <span className="machine ml-2 text-[10px] text-grey">{m.id}</span>
              </td>
              <td className="px-3 py-2 text-ink">{m.team}</td>
              <td className="machine px-3 py-2 text-ink">{fmtHours(m.workingMinutes)}</td>
              <td className="machine px-3 py-2 text-grey">{fmtHours(m.idleMinutes)}</td>
              <td className="px-3 py-2 text-ink">{m.topApplication}</td>
              <td className="px-3 py-2">
                <ActivityRibbon ribbon={m.ribbon} />
              </td>
              <td className="px-3 py-2">
                <span
                  className={cn(
                    "label rounded-sm border px-1.5 py-0.5",
                    m.sensorEquipped ? "border-green/40 bg-green/8 text-green" : "border-line bg-white text-grey",
                  )}
                >
                  {m.sensorEquipped ? "Deployed" : "Cloud-only"}
                </span>
              </td>
              <td className="machine px-3 py-2 text-xs text-grey">{m.lastSeen.slice(11, 16)}</td>
              <td className="px-3 py-2 text-grey">
                <ArrowRight className="size-3.5" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
