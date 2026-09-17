import Link from "next/link";
import { cn } from "cn";
import { BrandIcon } from "@/components/brand-icon";
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
  healthy: "border-line hover:border-emerald-300 hover:bg-emerald-50/40",
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
    <div className="grid grid-cols-2 gap-2.5 p-4 sm:grid-cols-3 lg:grid-cols-6">
      {CONNECTORS.map((c) => (
        <Link
          key={c.id}
          href={href}
          className={cn(
            "flex flex-col gap-1.5 rounded-sm border px-3 py-2.5",
            STATE_BORDER[c.state],
          )}
        >
          <div className="flex items-center gap-2">
            <BrandIcon name={c.name} className="size-4" />
            <span className="min-w-0 truncate text-xs font-medium text-ink">
              {c.name}
            </span>
            <span
              className={cn(
                "ml-auto size-1.5 shrink-0 rounded-full",
                STATE_DOT[c.state],
              )}
            />
          </div>
          <span
            className={cn(
              "machine text-[11px]",
              c.state === "healthy" ? "text-grey" : STATE_TEXT[c.state],
            )}
          >
            {c.state === "healthy"
              ? c.lastSeenAgo
              : `${c.state} · last seen ${c.lastSeenAgo}`}
          </span>
        </Link>
      ))}
    </div>
  );
}
