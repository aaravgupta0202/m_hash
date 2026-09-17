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
  { href: "/demo", label: "Dashboard", match: exact("/demo") },
  {
    href: "/demo/queue",
    label: "Investigation queue",
    match: (p) => prefix("/demo/queue")(p) || prefix("/demo/subject")(p),
  },
  {
    href: "/demo/connectors",
    label: "Connector health",
    match: prefix("/demo/connectors"),
  },
  {
    href: "/demo/suppressions",
    label: "Suppression log",
    match: prefix("/demo/suppressions"),
  },
];

export const WORKFORCE_NAV: NavItem[] = [
  {
    href: "/demo/workforce",
    label: "Org summary",
    match: (p) =>
      prefix("/demo/workforce")(p) &&
      !prefix("/demo/workforce/usage")(p) &&
      !prefix("/demo/workforce/captures")(p),
  },
  {
    href: "/demo/workforce/usage",
    label: "Application usage",
    match: prefix("/demo/workforce/usage"),
  },
  {
    href: "/demo/workforce/captures",
    label: "Screen captures",
    match: prefix("/demo/workforce/captures"),
  },
];

export const MODULE_HOME: Record<Module, string> = {
  risk: "/demo",
  workforce: "/demo/workforce",
};

export const MODULE_ROLE: Record<Module, string> = {
  risk: "SECURITY ANALYST",
  workforce: "WORKFORCE ADMIN",
};

/** The active module is derived from the URL — nothing is persisted. */
export function moduleForPath(pathname: string): Module {
  return prefix("/demo/workforce")(pathname) ? "workforce" : "risk";
}

/** Presenter shorthand names appear here and nowhere else in the UI (PRD §6). */
export const DEMO_SCENARIOS = [
  { label: "Priya — suppressed", href: "/demo/subject/8830" },
  { label: "Marcus — compromised", href: "/demo/subject/4912" },
  { label: "Dana — manufactured context", href: "/demo/subject/2071" },
] as const;

/** Single synthetic day every fixture lives on (PRD §4, §6). */
export const DEMO_DATE = "2026-09-14";
