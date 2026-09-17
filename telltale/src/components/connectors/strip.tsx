import Link from "next/link";
import { cn } from "cn";
import { CONNECTORS, type ConnectorState } from "@/lib/fixtures";

export const STATE_DOT: Record<ConnectorState, string> = {
  healthy: "bg-emerald-500",
  degraded: "bg-amber-500",
  silent: "bg-red-500",
};

export const STATE_TEXT: Record<ConnectorState, string> = {
  healthy: "text-emerald-700",
  degraded: "text-amber-700",
  silent: "text-red-700",
};

export const STATE_BORDER: Record<ConnectorState, string> = {
  healthy: "border-line bg-white hover:border-emerald-300 hover:bg-emerald-50/40",
  degraded: "border-amber-200 bg-amber-50/60 hover:border-amber-300",
  silent: "border-red-200 bg-red-50/60 hover:border-red-300",
};

/**
 * PRD §5.1 row 3 and §5.4: six chips with a dot and the last heartbeat. AWS
 * CloudTrail is amber on both screens off the same fixture, so the two pages
 * cannot disagree about it.
 */
export function ConnectorStrip({ href = "/connectors" }: { href?: string }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 p-4">
      {CONNECTORS.map((c) => (
        <Link
          key={c.id}
          href={href}
          className={cn(
            "flex flex-col gap-1.5 rounded-lg border px-3 py-2.5 shadow-xs transition-all",
            STATE_BORDER[c.state],
          )}
        >
          <div className="flex items-center gap-2">
            <span className={cn("size-2 shrink-0 rounded-full", STATE_DOT[c.state])} />
            <span className="min-w-0 truncate text-xs font-semibold text-slate-900">{c.name}</span>
          </div>
          <span className={cn("machine text-[11px]", c.state === "healthy" ? "text-slate-500" : STATE_TEXT[c.state])}>
            {c.state === "healthy" ? c.lastSeenAgo : `last seen ${c.lastSeenAgo}`}
          </span>
          <span className={cn("label text-[10px] uppercase font-bold tracking-wider", STATE_TEXT[c.state])}>{c.state}</span>
        </Link>
      ))}
    </div>
  );
}

