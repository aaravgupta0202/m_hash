/**
 * The tellTale mark — not a stock icon. A trace line with one deliberate
 * break in its rhythm, standing in for the idea the product is built on: an
 * otherwise-ordinary sequence with one step that gives it away. Drawn by
 * hand rather than pulled from an icon set, so the sidebar and the favicon
 * point at something that belongs to this product specifically.
 */
export function LogoMark({ className = "size-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden
    >
      <path
        d="M2.5 15.5H7L10 8L13.5 17L16.5 10.5H21.5"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="13.5" cy="17" r="1.6" fill="currentColor" />
    </svg>
  );
}
