import { cn } from "cn";
import { getBrandSlug } from "@/lib/brand-icons";

/**
 * Renders one of the real logos in public/brand-icons/ — see
 * src/lib/brand-icons.ts for how a name resolves to a file and why some of
 * those files are stand-ins rather than the exact official mark. This
 * component has no client-only behaviour (a plain `<img>` needs no
 * interactivity), so it stays a server component and can be used from
 * server-rendered tables and lists without forcing them client-side too.
 */
export function BrandIcon({ name, className = "size-4" }: { name: string; className?: string }) {
  const slug = getBrandSlug(name);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/brand-icons/${slug}.svg`}
      alt=""
      aria-hidden
      loading="lazy"
      className={cn("inline-block size-4 shrink-0 object-contain", className)}
    />
  );
}
