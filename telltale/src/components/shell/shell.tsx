"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { FilterProvider } from "@/lib/filters";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { DemoLauncher } from "./demo-launcher";

interface SidebarContextType {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean | ((prev: boolean) => boolean)) => void;
  toggleCollapsed: () => void;
}

const SidebarContext = createContext<SidebarContextType>({
  collapsed: false,
  setCollapsed: () => {},
  toggleCollapsed: () => {},
});

export const useSidebar = () => useContext(SidebarContext);

export function Shell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const toggleCollapsed = () => setCollapsed((prev) => !prev);

  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed, toggleCollapsed }}>
      <FilterProvider>
        <div className="flex min-h-screen bg-background text-foreground transition-colors duration-200">
          <Sidebar />
          <div className="flex min-w-0 flex-1 flex-col">
            <Topbar />
            <main className="min-w-0 flex-1 px-6 py-5 pb-20">{children}</main>
          </div>
          <DemoLauncher />
        </div>
      </FilterProvider>
    </SidebarContext.Provider>
  );
}

