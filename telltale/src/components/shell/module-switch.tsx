"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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

const MODULES: { id: Module; label: string }[] = [
  { id: "risk", label: "Risk" },
  { id: "workforce", label: "Workforce" },
];

/**
 * PRD §4: switching modules shows a one-line interstitial, then proceeds.
 * The point is to make the control visible, not to block the presenter.
 */
export function ModuleSwitch({ current }: { current: Module }) {
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
      <div role="tablist" aria-label="Module" className="grid grid-cols-2 rounded-sm border border-line p-0.5">
        {MODULES.map((m) => {
          const active = m.id === current;
          return (
            <button
              key={m.id}
              role="tab"
              type="button"
              aria-selected={active}
              onClick={() => !active && setPending(m.id)}
              className={cn(
                "rounded-[2px] px-2 py-1 text-xs font-medium",
                active ? "bg-purple text-white" : "text-grey hover:bg-purple-lt hover:text-purple",
              )}
            >
              {m.label}
            </button>
          );
        })}
      </div>

      <Dialog open={pending !== null} onOpenChange={(open) => !open && setPending(null)}>
        <DialogContent showCloseButton={false} className="rounded-sm ring-line">
          <DialogHeader>
            <DialogTitle>Crossing modules is an audited action.</DialogTitle>
            <DialogDescription>
              In production this requires both role grants. You are switching from{" "}
              <span className="machine text-ink">{MODULE_ROLE[current]}</span> to{" "}
              <span className="machine text-ink">{pending ? MODULE_ROLE[pending] : ""}</span>.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="rounded-b-sm">
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
