import { cn } from "cn";

/**
 * The tellTale mark: bold, modern "tT" typography badge.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center font-black tracking-tight select-none leading-none",
        className,
      )}
      style={{ letterSpacing: "-0.05em" }}
      aria-hidden
    >
      tT
    </span>
  );
}

