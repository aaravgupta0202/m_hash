"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, Briefcase, AlertTriangle } from "lucide-react";
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
      <div role="tablist" aria-label="Module" className="grid grid-cols-2 rounded-lg border border-line bg-slate-100/80 p-1">
        {MODULES.map((m) => {
          const active = m.id === current;
          const Icon = m.Icon;
          return (
            <button
              key={m.id}
              role="tab"
              type="button"
              aria-selected={active}
              onClick={() => !active && setPending(m.id)}
              className={cn(
                "flex items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition-all",
                active
                  ? "border border-emerald-200 bg-white text-emerald-800 font-semibold shadow-xs"
                  : "text-slate-600 hover:bg-slate-200/60 hover:text-slate-900",
              )}
            >
              <Icon className={cn("size-3.5", active ? "text-emerald-600" : "text-slate-500")} />
              <span>{m.label}</span>
            </button>
          );
        })}
      </div>

      <Dialog open={pending !== null} onOpenChange={(open) => !open && setPending(null)}>
        <DialogContent showCloseButton={false} className="rounded-lg border border-line bg-white text-slate-900 shadow-2xl z-50">
          <DialogHeader>
            <div className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="size-5" />
              <DialogTitle className="text-slate-900 text-base font-semibold">Crossing modules is an audited action</DialogTitle>
            </div>
            <DialogDescription className="text-slate-600 text-xs leading-relaxed pt-1.5">
              In production this requires both role grants. You are switching from{" "}
              <span className="machine font-semibold text-emerald-800 bg-emerald-50 px-1 py-0.5 rounded border border-emerald-200">
                {MODULE_ROLE[current]}
              </span>{" "}
              to{" "}
              <span className="machine font-semibold text-emerald-800 bg-emerald-50 px-1 py-0.5 rounded border border-emerald-200">
                {pending ? MODULE_ROLE[pending] : ""}
              </span>.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-3">
            <Button
              variant="outline"
              onClick={() => setPending(null)}
              className="border-line bg-slate-100 text-slate-700 hover:bg-slate-200"
            >
              Stay
            </Button>
            <Button
              onClick={proceed}
              className="border border-emerald-600 bg-emerald-600 text-white font-semibold hover:bg-emerald-700 shadow-xs"
            >
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

