"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "cn";
import { MODULE_ROLE, RISK_NAV, WORKFORCE_NAV, moduleForPath, normalisePath, type NavItem } from "@/lib/nav";
import { ModuleSwitch } from "./module-switch";
import { ProfileChip } from "./profile-chip";

export function Sidebar() {
  const pathname = normalisePath(usePathname());
  const mod = moduleForPath(pathname);
  const items = mod === "risk" ? RISK_NAV : WORKFORCE_NAV;

  return (
    <aside className="sticky top-0 flex h-screen w-60 shrink-0 flex-col border-r border-line bg-white">
      <div className="border-b border-line px-4 py-4">
        <div className="flex items-baseline gap-1.5">
          <span className="text-lg font-semibold tracking-tight text-purple">tellTale</span>
          <span className="label text-grey">console</span>
        </div>
        <p className="mt-1 text-xs leading-snug text-grey">
          Context-aware behavioural transition detection
        </p>
      </div>

      <div className="border-b border-line px-3 py-3">
        <ModuleSwitch current={mod} />
        <div className="mt-2 flex items-center gap-1.5 px-1">
          <span className="label text-grey">Role</span>
          <span className="label rounded-sm bg-purple-lt px-1.5 py-0.5 text-purple">{MODULE_ROLE[mod]}</span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-3">
        <p className="label mb-1.5 px-2 text-grey">
          {mod === "risk" ? "Risk · pseudonymous" : "Workforce · named"}
        </p>
        <ul className="space-y-0.5">
          {items.map((item) => (
            <NavLink key={item.href} item={item} active={item.match(pathname)} />
          ))}
        </ul>
      </nav>

      <div className="space-y-2 border-t border-line px-3 py-3">
        <ProfileChip />
        <Link
          href="/about"
          className={cn(
            "block rounded-sm px-2 py-1.5 text-sm text-grey hover:bg-purple-lt hover:text-purple",
            pathname === "/about" && "bg-purple-lt text-purple",
          )}
        >
          About this build
        </Link>
        <div className="rounded-sm border border-amber/40 bg-amber/5 px-2 py-1.5">
          <p className="label text-amber">Demo build — all data synthetic</p>
        </div>
      </div>
    </aside>
  );
}

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  return (
    <li>
      <Link
        href={item.href}
        aria-current={active ? "page" : undefined}
        className={cn(
          "block rounded-sm border-l-2 px-2 py-1.5 text-sm",
          active
            ? "border-purple bg-purple-lt font-medium text-purple"
            : "border-transparent text-ink hover:bg-purple-lt/60 hover:text-purple",
        )}
      >
        {item.label}
      </Link>
    </li>
  );
}
