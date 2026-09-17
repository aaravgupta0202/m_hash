import type { ReactNode } from "react";
import { cn } from "cn";

/**
 * The only surface in the build: 1px border, small radius, no shadow, no
 * tinted header band. Everything on every screen sits in one of these.
 */
export function Panel({
  title,
  sub,
  right,
  footnote,
  className,
  bodyClassName,
  children,
}: {
  title?: ReactNode;
  sub?: ReactNode;
  right?: ReactNode;
  footnote?: ReactNode;
  className?: string;
  bodyClassName?: string;
  children?: ReactNode;
}) {
  return (
    <section className={cn("panel flex min-w-0 flex-col", className)}>
      {(title || right) && (
        <header className="flex items-start justify-between gap-4 border-b border-line px-4 py-3">
          <div className="min-w-0">
            {title && <h2 className="label text-ink">{title}</h2>}
            {sub && (
              <p className="mt-1 text-xs leading-relaxed text-grey">{sub}</p>
            )}
          </div>
          {right && <div className="shrink-0">{right}</div>}
        </header>
      )}
      <div className={cn("min-w-0 flex-1", bodyClassName ?? "p-4")}>
        {children}
      </div>
      {footnote && (
        <footer className="border-t border-line px-4 py-2.5 text-xs leading-relaxed text-grey">
          {footnote}
        </footer>
      )}
    </section>
  );
}

/** Label / value pair used in headers and summary strips. */
export function Field({
  label,
  children,
  mono,
}: {
  label: string;
  children: ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="min-w-0">
      <p className="label text-grey">{label}</p>
      <p className={cn("mt-0.5 truncate text-sm text-ink", mono && "machine")}>
        {children}
      </p>
    </div>
  );
}
