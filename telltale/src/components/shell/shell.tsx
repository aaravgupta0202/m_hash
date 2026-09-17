"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { FilterProvider } from "@/lib/filters";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { DemoLauncher } from "./demo-launcher";
import { MethodologyInfo } from "./methodology-info";

interface SidebarContextType {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean | ((prev: boolean) => boolean)) => void;
  toggleCollapsed: () => void;
  /** The below-`lg` off-canvas drawer state — independent of `collapsed`,
   * which only ever means "desktop icon-only rail" (see sidebar.tsx). */
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType>({
  collapsed: false,
  setCollapsed: () => {},
  toggleCollapsed: () => {},
  mobileOpen: false,
  setMobileOpen: () => {},
});

export const useSidebar = () => useContext(SidebarContext);

export function Shell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const toggleCollapsed = () => setCollapsed((prev) => !prev);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <SidebarContext.Provider
      value={{ collapsed, setCollapsed, toggleCollapsed, mobileOpen, setMobileOpen }}
    >
      <FilterProvider>
        <div className="flex min-h-screen bg-background text-foreground transition-colors duration-200">
          {/* Backdrop for the mobile drawer — the sidebar itself sits above
              this (z-40 vs z-30), a plain click-to-close, no focus trap or
              scroll-lock: this is a demo console, not a production app. */}
          {mobileOpen && (
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-30 bg-ink/30 lg:hidden"
            />
          )}
          <Sidebar />
          <div className="flex min-w-0 flex-1 flex-col">
            <Topbar />
            <main className="min-w-0 flex-1 px-4 py-4 pb-20 sm:px-6 sm:py-5">
              {children}
            </main>
          </div>
          <DemoLauncher />
          <MethodologyInfo />
        </div>
      </FilterProvider>
    </SidebarContext.Provider>
  );
}
