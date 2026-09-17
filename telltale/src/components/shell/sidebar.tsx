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
  Shield,
  Briefcase,
  Layers,
} from "lucide-react";
import { cn } from "cn";
import { MODULE_ROLE, RISK_NAV, WORKFORCE_NAV, moduleForPath, normalisePath, type NavItem } from "@/lib/nav";
import { ModuleSwitch } from "./module-switch";
import { ProfileChip } from "./profile-chip";
import { useSidebar } from "./shell";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

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

export function Sidebar() {
  const pathname = normalisePath(usePathname());
  const mod = moduleForPath(pathname);
  const items = mod === "risk" ? RISK_NAV : WORKFORCE_NAV;
  const { collapsed, toggleCollapsed } = useSidebar();

  return (
    <aside
      className={cn(
        "sticky top-0 z-30 flex h-screen shrink-0 flex-col border-r border-line bg-white text-slate-900 transition-all duration-200 shadow-xs",
        collapsed ? "w-18" : "w-64",
      )}
    >
      {/* Header & Logo */}
      <div className={cn("border-b border-line p-3.5", collapsed ? "px-2 text-center" : "px-4")}>
        <div className="flex items-center justify-between">
          <Link href="/" className="group flex items-center gap-2.5 overflow-hidden">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-md border border-emerald-200 bg-emerald-50 text-emerald-600 shadow-xs">
              <Layers className="size-4.5 text-emerald-600" />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-base tracking-tight text-slate-900 group-hover:text-emerald-700 transition-colors">
                    tellTale
                  </span>
                  <span className="label rounded-[3px] bg-emerald-50 px-1.5 py-0.2 text-[9px] font-bold text-emerald-700 border border-emerald-200">
                    CONSOLE
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 truncate">Transition Detection</span>
              </div>
            )}
          </Link>
          <button
            type="button"
            onClick={toggleCollapsed}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={cn(
              "flex size-7 items-center justify-center rounded border border-line text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors",
              collapsed && "mx-auto mt-2",
            )}
          >
            {collapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
          </button>
        </div>
      </div>

      {/* Module Switcher */}
      <div className={cn("border-b border-line", collapsed ? "p-2 text-center" : "p-3")}>
        {collapsed ? (
          <Tooltip>
            <TooltipTrigger render={<div className="flex justify-center" />}>
              <div
                className="flex size-9 items-center justify-center rounded border border-emerald-200 bg-emerald-50 text-emerald-700"
                title={`Active: ${MODULE_ROLE[mod]}`}
              >
                {mod === "risk" ? <Shield className="size-4.5" /> : <Briefcase className="size-4.5" />}
              </div>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-slate-900 border border-slate-800 text-white">
              Role: {MODULE_ROLE[mod]}
            </TooltipContent>
          </Tooltip>
        ) : (
          <>
            <ModuleSwitch current={mod} />
            <div className="mt-2.5 flex items-center justify-between px-1">
              <span className="label text-slate-500 text-[10px]">Active Role</span>
              <span className="label rounded border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                {MODULE_ROLE[mod]}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-3">
        {!collapsed && (
          <p className="label mb-2 px-2 text-[10px] text-slate-400">
            {mod === "risk" ? "Risk Module · Pseudonymous" : "Workforce Module · Named"}
          </p>
        )}
        <ul className="space-y-1">
          {items.map((item) => (
            <NavLink key={item.href} item={item} active={item.match(pathname)} collapsed={collapsed} />
          ))}
        </ul>
      </nav>

      {/* Footer Controls & Honesty Badge */}
      <div className="space-y-2 border-t border-line p-2.5">
        {!collapsed ? (
          <>
            <ProfileChip />
            <Link
              href="/about"
              className={cn(
                "flex items-center gap-2 rounded px-2.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors",
                pathname === "/about" && "bg-emerald-50 text-emerald-800 font-semibold border-l-2 border-emerald-600",
              )}
            >
              <Info className="size-4 text-emerald-600 shrink-0" />
              <span>About this build</span>
            </Link>
            <div className="rounded border border-emerald-200 bg-emerald-50/70 px-2.5 py-1.5">
              <p className="label text-emerald-800 flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-emerald-600 animate-pulse" />
                Demo build — all data synthetic
              </p>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center space-y-2">
            <Tooltip>
              <TooltipTrigger
                render={
                  <Link
                    href="/about"
                    className={cn(
                      "flex size-9 items-center justify-center rounded text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors",
                      pathname === "/about" && "bg-emerald-50 text-emerald-700 border border-emerald-200",
                    )}
                  />
                }
              >
                <Info className="size-4.5" />
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-slate-900 border border-slate-800 text-white">
                About this build
              </TooltipContent>
            </Tooltip>

            {/* Note: Honesty badge MUST be in HTML for check-export.mjs */}
            <Tooltip>
              <TooltipTrigger
                render={
                  <div className="flex size-7 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700">
                    <span className="size-2 rounded-full bg-emerald-600 animate-pulse" />
                  </div>
                }
              >
                <span className="sr-only">Demo build — all data synthetic</span>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-slate-900 border border-slate-800 text-white">
                Demo build — all data synthetic
              </TooltipContent>
            </Tooltip>
          </div>
        )}
      </div>
    </aside>
  );
}

function NavLink({ item, active, collapsed }: { item: NavItem; active: boolean; collapsed: boolean }) {
  const Icon = NAV_ICONS[item.href] ?? LayoutDashboard;

  if (collapsed) {
    return (
      <li>
        <Tooltip>
          <TooltipTrigger
            render={
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex size-9 items-center justify-center rounded transition-all",
                  active
                    ? "border border-emerald-200 bg-emerald-50 text-emerald-700 shadow-xs font-semibold"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-900",
                )}
              />
            }
          >
            <Icon className="size-4.5" />
          </TooltipTrigger>
          <TooltipContent side="right" className="bg-slate-900 border border-slate-800 text-white">
            {item.label}
          </TooltipContent>
        </Tooltip>
      </li>
    );
  }

  return (
    <li>
      <Link
        href={item.href}
        aria-current={active ? "page" : undefined}
        className={cn(
          "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-xs transition-all",
          active
            ? "border-l-2 border-emerald-600 bg-emerald-50 font-semibold text-emerald-900 shadow-xs"
            : "border-l-2 border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900",
        )}
      >
        <Icon className={cn("size-4 shrink-0", active ? "text-emerald-600" : "text-slate-400")} />
        <span className="truncate">{item.label}</span>
      </Link>
    </li>
  );
}

