"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShieldAlert,
  Radio,
  ShieldCheck,
  Users,
  BarChart3,
  Camera,
  Info,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { cn } from "cn";
import { LogoMark } from "@/components/brand/logo-mark";
import {
  MODULE_ROLE,
  RISK_NAV,
  WORKFORCE_NAV,
  moduleForPath,
  normalisePath,
  type NavItem,
} from "@/lib/nav";
import { ModuleSwitch } from "./module-switch";
import { ProfileChip } from "./profile-chip";
import { useSidebar } from "./shell";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const NAV_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  "/": LayoutDashboard,
  "/queue": ShieldAlert,
  "/connectors": Radio,
  "/suppressions": ShieldCheck,
  "/workforce": Users,
  "/workforce/usage": BarChart3,
  "/workforce/captures": Camera,
  "/about": Info,
};

/**
 * The collapse used to swap in an entirely different subtree per row — one
 * JSX branch for expanded, an unrelated one for collapsed (a lone icon in a
 * Tooltip). Toggling `collapsed` unmounted one and mounted the other in the
 * same frame the width transition started, so for the ~200ms the <aside>
 * was still animating narrower, the content inside had already popped to
 * its end state: icons jumping, badges vanishing mid-flight, the module
 * switcher briefly rendering as one icon instead of two. That's the glitch.
 *
 * Every row below is now a single markup tree at every width. Only the
 * parts that should disappear when collapsed carry `w-0 opacity-0` (via
 * `collapsible`), so they shrink and fade over the same 200ms as the rail
 * itself instead of unmounting out from under it. Tooltips are always
 * present too — they only *show* on hover regardless of width, so there's
 * no structural fork left to desync.
 */
const collapsible = (collapsed: boolean, extra?: string) =>
  cn(
    "overflow-hidden whitespace-nowrap transition-all duration-200",
    collapsed ? "w-0 opacity-0" : "opacity-100",
    extra,
  );

export function Sidebar() {
  const pathname = normalisePath(usePathname());
  const mod = moduleForPath(pathname);
  const items = mod === "risk" ? RISK_NAV : WORKFORCE_NAV;
  const { collapsed, toggleCollapsed } = useSidebar();

  return (
    <aside
      className={cn(
        "sticky top-0 z-30 flex h-screen shrink-0 flex-col border-r border-line bg-white transition-[width] duration-200",
        collapsed ? "w-16" : "w-64",
      )}
    >
      {/* Header */}
      <div className="flex h-14 shrink-0 items-center gap-2 border-b border-line px-3">
        <Link href="/demo" className="flex min-w-0 flex-1 items-center gap-2.5">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-sm border border-purple/30 bg-purple-lt text-purple">
            <LogoMark className="size-4" />
          </div>
          <div className={collapsible(collapsed, "flex min-w-0 flex-col")}>
            <span className="truncate text-sm font-semibold tracking-tight text-ink">
              tellTale
            </span>
            <span className="truncate text-[10px] text-grey">
              Transition detection
            </span>
          </div>
        </Link>
        <button
          type="button"
          onClick={toggleCollapsed}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="flex size-7 shrink-0 items-center justify-center rounded-sm text-grey hover:bg-purple-lt hover:text-purple"
        >
          {collapsed ? (
            <PanelLeftOpen className="size-4" />
          ) : (
            <PanelLeftClose className="size-4" />
          )}
        </button>
      </div>

      {/* Module switcher */}
      <div className="shrink-0 border-b border-line p-2.5">
        <ModuleSwitch current={mod} collapsed={collapsed} />
        <div
          className={collapsible(
            collapsed,
            "mt-2 flex items-center justify-between px-0.5",
          )}
        >
          <span className="label text-grey">Role</span>
          <span className="label rounded-sm bg-purple-lt px-1.5 py-0.5 text-purple">
            {MODULE_ROLE[mod]}
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-x-hidden overflow-y-auto px-2 py-3">
        <p className={collapsible(collapsed, "label mb-1.5 px-2 text-grey")}>
          {mod === "risk" ? "Risk · pseudonymous" : "Workforce · named"}
        </p>
        <ul className="space-y-0.5">
          {items.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              active={item.match(pathname)}
              collapsed={collapsed}
            />
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="shrink-0 space-y-2 border-t border-line p-2.5">
        <div className={collapsed ? "hidden" : "block"}>
          <ProfileChip />
        </div>

        <Tooltip>
          <TooltipTrigger
            render={
              <Link
                href="/demo/about"
                className={cn(
                  "flex items-center gap-2 rounded-sm px-2 py-1.5 text-xs text-grey hover:bg-purple-lt hover:text-purple",
                  pathname === "/about" && "bg-purple-lt text-purple",
                )}
              />
            }
          >
            <Info className="size-3.5 shrink-0" />
            <span className={collapsible(collapsed)}>About this build</span>
          </TooltipTrigger>
          {collapsed && (
            <TooltipContent
              side="right"
              className="border border-slate-800 bg-slate-900 text-white"
            >
              About this build
            </TooltipContent>
          )}
        </Tooltip>

        {/* Honesty badge (PRD §4) — must render in HTML regardless of width,
            so check-export.mjs finds it on every page. No pulse: the whole
            point of this line is that nothing here is live. */}
        <Tooltip>
          <TooltipTrigger
            render={
              <div
                className={cn(
                  "flex items-center gap-1.5 rounded-sm border border-amber-200 bg-amber-50 px-2 py-1.5",
                  collapsed && "justify-center px-0",
                )}
              />
            }
          >
            <span className="size-1.5 shrink-0 rounded-full bg-amber-500" />
            <span
              className={cn("label text-amber-800", collapsible(collapsed))}
            >
              Demo build — all data synthetic
            </span>
          </TooltipTrigger>
          {collapsed && (
            <TooltipContent
              side="right"
              className="border border-slate-800 bg-slate-900 text-white"
            >
              Demo build — all data synthetic
            </TooltipContent>
          )}
        </Tooltip>
      </div>
    </aside>
  );
}

function NavLink({
  item,
  active,
  collapsed,
}: {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
}) {
  const Icon = NAV_ICONS[item.href] ?? LayoutDashboard;

  return (
    <li>
      <Tooltip>
        <TooltipTrigger
          render={
            <Link
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-2.5 rounded-sm border-l-2 px-2 py-2 text-sm",
                active
                  ? "border-purple bg-purple-lt font-medium text-purple"
                  : "border-transparent text-ink hover:bg-purple-lt/60 hover:text-purple",
                collapsed && "justify-center px-0",
              )}
            />
          }
        >
          <Icon
            className={cn(
              "size-4 shrink-0",
              active ? "text-purple" : "text-grey",
            )}
          />
          <span className={collapsible(collapsed, "truncate")}>
            {item.label}
          </span>
        </TooltipTrigger>
        {collapsed && (
          <TooltipContent
            side="right"
            className="border border-slate-800 bg-slate-900 text-white"
          >
            {item.label}
          </TooltipContent>
        )}
      </Tooltip>
    </li>
  );
}
