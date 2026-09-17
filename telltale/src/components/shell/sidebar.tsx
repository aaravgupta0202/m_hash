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
  X,
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
  "/demo": LayoutDashboard,
  "/demo/queue": ShieldAlert,
  "/demo/connectors": Radio,
  "/demo/suppressions": ShieldCheck,
  "/demo/workforce": Users,
  "/demo/workforce/usage": BarChart3,
  "/demo/workforce/captures": Camera,
  "/demo/about": Info,
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
 *
 * `collapsed` (the icon-only rail) is a desktop-only concept — the `lg:`
 * prefix below means a phone or tablet always sees full labels, because
 * below `lg` the sidebar isn't a rail at all, it's an off-canvas drawer
 * (`mobileOpen`, a separate piece of state) with room to spare.
 */
const collapsible = (collapsed: boolean, extra?: string) =>
  cn(
    "overflow-hidden whitespace-nowrap opacity-100 transition-all duration-200",
    collapsed && "lg:w-0 lg:opacity-0",
    extra,
  );

export function Sidebar() {
  const pathname = normalisePath(usePathname());
  const mod = moduleForPath(pathname);
  const items = mod === "risk" ? RISK_NAV : WORKFORCE_NAV;
  const { collapsed, toggleCollapsed, mobileOpen, setMobileOpen } = useSidebar();

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 flex h-screen w-64 shrink-0 -translate-x-full flex-col border-r border-line bg-white transition-transform duration-200",
        "lg:sticky lg:top-0 lg:z-30 lg:translate-x-0 lg:transition-[width]",
        mobileOpen && "translate-x-0",
        collapsed ? "lg:w-16" : "lg:w-64",
      )}
    >
      {/* Header */}
      <div
        className={cn(
          "flex h-14 shrink-0 items-center border-b border-line",
          collapsed ? "justify-center px-2" : "justify-between px-3 gap-2",
        )}
      >
        {collapsed ? (
          <button
            type="button"
            onClick={toggleCollapsed}
            title="Expand sidebar"
            className="group flex size-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white transition-all shadow-xs"
          >
            <span className="font-black text-sm group-hover:hidden">tT</span>
            <PanelLeftOpen className="hidden size-4 group-hover:block" />
          </button>
        ) : (
          <>
            <Link
              href="/demo"
              onClick={() => setMobileOpen(false)}
              className="flex min-w-0 flex-1 items-center gap-2.5"
            >
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white font-black text-xs shadow-xs">
                <LogoMark />
              </div>
              <div className={collapsible(collapsed, "flex min-w-0 flex-col")}>
                <span className="truncate text-sm font-bold tracking-tight text-ink">
                  tellTale
                </span>
                <span className="truncate text-[10px] text-slate-500 font-medium">
                  Activity & Risk Monitor
                </span>
              </div>
            </Link>
            <button
              type="button"
              onClick={toggleCollapsed}
              title="Collapse sidebar"
              className="hidden size-7 shrink-0 items-center justify-center rounded-md text-slate-400 hover:bg-emerald-50 hover:text-emerald-700 lg:flex transition-colors"
            >
              <PanelLeftClose className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              title="Close menu"
              className="flex size-7 shrink-0 items-center justify-center rounded-md text-slate-400 hover:bg-emerald-50 hover:text-emerald-700 lg:hidden transition-colors"
            >
              <X className="size-4" />
            </button>
          </>
        )}
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
          <span className="label text-slate-500">Role</span>
          <span className="label rounded border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-emerald-800">
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
              onNavigate={() => setMobileOpen(false)}
            />
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="shrink-0 space-y-2 border-t border-line p-2.5">
        <div className={cn("block", collapsed && "lg:hidden")}>
          <ProfileChip />
        </div>

        <Tooltip>
          <TooltipTrigger
            render={
              <Link
                href="/demo/about"
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-2 rounded-sm px-2 py-1.5 text-xs text-slate-600 hover:bg-emerald-50 hover:text-emerald-800 transition-colors",
                  pathname === "/demo/about" && "bg-emerald-50 text-emerald-800 font-semibold",
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
                  collapsed && "lg:justify-center lg:px-0",
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
  onNavigate,
}: {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const Icon = NAV_ICONS[item.href] ?? LayoutDashboard;

  return (
    <li>
      <Tooltip>
        <TooltipTrigger
          render={
            <Link
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-2.5 rounded-sm border-l-2 px-2 py-2 text-sm transition-colors",
                active
                  ? "border-emerald-600 bg-emerald-50/80 font-semibold text-emerald-900"
                  : "border-transparent text-slate-700 hover:bg-slate-50 hover:text-slate-900",
                collapsed && "lg:justify-center lg:px-0",
              )}
            />
          }
        >
          <Icon
            className={cn(
              "size-4 shrink-0 transition-colors",
              active ? "text-emerald-600" : "text-slate-400",
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
