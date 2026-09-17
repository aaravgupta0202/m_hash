export type Module = "risk" | "workforce";

export interface NavItem {
  href: string;
  label: string;
  /** Whether this item is the active section for a given pathname. */
  match: (pathname: string) => boolean;
}

/**
 * next.config sets trailingSlash, so usePathname() returns "/about/" rather
 * than "/about". Every matcher in this file compares against the normalised
 * form so an exact match still works.
 */
export function normalisePath(pathname: string): string {
  return pathname.length > 1 && pathname.endsWith("/")
    ? pathname.slice(0, -1)
    : pathname;
}

const exact = (href: string) => (p: string) => normalisePath(p) === href;
const prefix = (href: string) => (p: string) => {
  const n = normalisePath(p);
  return n === href || n.startsWith(href + "/");
};

export const RISK_NAV: NavItem[] = [
  { href: "/", label: "Dashboard", match: exact("/") },
  {
    href: "/queue",
    label: "Investigation queue",
    match: (p) => prefix("/queue")(p) || prefix("/subject")(p),
  },
  {
    href: "/connectors",
    label: "Connector health",
    match: prefix("/connectors"),
  },
  {
    href: "/suppressions",
    label: "Suppression log",
    match: prefix("/suppressions"),
  },
];

export const WORKFORCE_NAV: NavItem[] = [
  {
    href: "/workforce",
    label: "Org summary",
    match: (p) =>
      prefix("/workforce")(p) &&
      !prefix("/workforce/usage")(p) &&
      !prefix("/workforce/captures")(p),
  },
  {
    href: "/workforce/usage",
    label: "Application usage",
    match: prefix("/workforce/usage"),
  },
  {
    href: "/workforce/captures",
    label: "Screen captures",
    match: prefix("/workforce/captures"),
  },
];

export const MODULE_HOME: Record<Module, string> = {
  risk: "/",
  workforce: "/workforce",
};

export const MODULE_ROLE: Record<Module, string> = {
  risk: "SECURITY ANALYST",
  workforce: "WORKFORCE ADMIN",
};

/** The active module is derived from the URL — nothing is persisted. */
export function moduleForPath(pathname: string): Module {
  return prefix("/workforce")(pathname) ? "workforce" : "risk";
}

/** Presenter shorthand names appear here and nowhere else in the UI (PRD §6). */
export const DEMO_SCENARIOS = [
  { label: "Priya — suppressed", href: "/subject/8830" },
  { label: "Marcus — compromised", href: "/subject/4912" },
  { label: "Dana — manufactured context", href: "/subject/2071" },
] as const;

/** Single synthetic day every fixture lives on (PRD §4, §6). */
export const DEMO_DATE = "2026-09-14";
