"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, Briefcase } from "lucide-react";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MODULE_HOME, MODULE_ROLE, type Module } from "@/lib/nav";

const MODULES: { id: Module; label: string; Icon: typeof Shield }[] = [
  { id: "risk", label: "Risk", Icon: Shield },
  { id: "workforce", label: "Workforce", Icon: Briefcase },
];

/**
 * PRD §4: switching modules shows a one-line interstitial, then proceeds.
 * The point is to make the control visible, not to block the presenter.
 *
 * Collapsed sidebar gets the same two buttons, just icon-only — not a
 * different component, so there's nothing to desync during the width
 * transition (see the note in sidebar.tsx).
 */
export function ModuleSwitch({
  current,
  collapsed = false,
}: {
  current: Module;
  collapsed?: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = useState<Module | null>(null);

  const proceed = () => {
    if (!pending) return;
    const target = MODULE_HOME[pending];
    setPending(null);
    router.push(target);
  };

  return (
    <>
      <div
        role="tablist"
        aria-label="Module"
        className={cn(
          "grid gap-1 rounded-sm border border-line bg-slate-50 p-1",
          collapsed ? "grid-cols-1" : "grid-cols-2",
        )}
      >
        {MODULES.map((m) => {
          const active = m.id === current;
          const Icon = m.Icon;
          return (
            <button
              key={m.id}
              role="tab"
              type="button"
              title={collapsed ? m.label : undefined}
              aria-selected={active}
              onClick={() => !active && setPending(m.id)}
              className={cn(
                "flex items-center justify-center gap-1.5 rounded-sm py-1.5 text-xs font-medium",
                collapsed ? "px-0" : "px-2",
                active
                  ? "border border-emerald-200 bg-white text-emerald-800"
                  : "border border-transparent text-slate-600 hover:bg-white hover:text-slate-900",
              )}
            >
              <Icon
                className={cn(
                  "size-3.5 shrink-0",
                  active ? "text-emerald-600" : "text-slate-400",
                )}
              />
              {!collapsed && <span>{m.label}</span>}
            </button>
          );
        })}
      </div>

      <Dialog
        open={pending !== null}
        onOpenChange={(open) => !open && setPending(null)}
      >
        <DialogContent showCloseButton={false} className="rounded-sm">
          <DialogHeader>
            <DialogTitle>Crossing modules is an audited action.</DialogTitle>
            <DialogDescription>
              In production this requires both role grants. You are switching
              from{" "}
              <span className="machine rounded-sm border border-emerald-200 bg-emerald-50 px-1 py-0.5 text-emerald-800">
                {MODULE_ROLE[current]}
              </span>{" "}
              to{" "}
              <span className="machine rounded-sm border border-emerald-200 bg-emerald-50 px-1 py-0.5 text-emerald-800">
                {pending ? MODULE_ROLE[pending] : ""}
              </span>
              .
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPending(null)}>
              Stay
            </Button>
            <Button onClick={proceed}>Continue</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
