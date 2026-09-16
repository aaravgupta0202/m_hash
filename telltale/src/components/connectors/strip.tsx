import Link from "next/link";
import { cn } from "cn";
import { CONNECTORS, type ConnectorState } from "@/lib/fixtures";

export const STATE_DOT: Record<ConnectorState, string> = {
  healthy: "bg-green",
  degraded: "bg-amber",
  silent: "bg-red",
};

export const STATE_TEXT: Record<ConnectorState, string> = {
  healthy: "text-green",
  degraded: "text-amber",
  silent: "text-red",
};

export const STATE_BORDER: Record<ConnectorState, string> = {
  healthy: "border-line",
  degraded: "border-amber/50 bg-amber/5",
  silent: "border-red/50 bg-red/5",
};

/**
 * PRD §5.1 row 3 and §5.4: six chips with a dot and the last heartbeat. AWS
 * CloudTrail is amber on both screens off the same fixture, so the two pages
 * cannot disagree about it.
 */
export function ConnectorStrip({ href = "/connectors" }: { href?: string }) {
  return (
    <div className="grid grid-cols-6 gap-2 p-4">
      {CONNECTORS.map((c) => (
        <Link
          key={c.id}
          href={href}
          className={cn(
            "flex flex-col gap-1.5 rounded-sm border px-3 py-2.5 hover:bg-purple-lt/60",
            STATE_BORDER[c.state],
          )}
        >
          <div className="flex items-center gap-1.5">
            <span className={cn("size-2 shrink-0 rounded-full", STATE_DOT[c.state])} />
            <span className="min-w-0 truncate text-sm font-medium text-ink">{c.name}</span>
          </div>
          <span className={cn("machine text-[11px]", c.state === "healthy" ? "text-grey" : STATE_TEXT[c.state])}>
            {c.state === "healthy" ? c.lastSeenAgo : `last seen ${c.lastSeenAgo}`}
          </span>
          <span className={cn("label", STATE_TEXT[c.state])}>{c.state}</span>
        </Link>
      ))}
    </div>
  );
}
