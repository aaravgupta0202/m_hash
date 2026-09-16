import type { ReactNode } from "react";
import { FilterProvider } from "@/lib/filters";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { DemoLauncher } from "./demo-launcher";

export function Shell({ children }: { children: ReactNode }) {
  return (
    <FilterProvider>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar />
          <main className="min-w-0 flex-1 px-6 py-5 pb-20">{children}</main>
        </div>
        <DemoLauncher />
      </div>
    </FilterProvider>
  );
}
