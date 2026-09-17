"use client";

import { Globe } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

/**
 * PRD §7.8: the jurisdiction profile is visible. Content follows master doc
 * §3.8.1 — what the Full profile enables and what EU standard would disable.
 */
export function ProfileChip() {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <button
            type="button"
            className="flex w-full items-center justify-between rounded-md border border-line bg-slate-50 px-2.5 py-1.5 text-left hover:bg-emerald-50 hover:border-emerald-300 transition-colors shadow-2xs"
          />
        }
      >
        <div className="flex items-center gap-1.5">
          <Globe className="size-3.5 text-emerald-600" />
          <span className="label text-slate-500 text-[10px]">Profile</span>
        </div>
        <span className="machine text-[11px] font-bold text-emerald-700">FULL (INDIA/US)</span>
      </TooltipTrigger>
      <TooltipContent side="right" align="end" className="max-w-72 bg-slate-900 border border-slate-800 p-3 text-slate-200 shadow-xl z-50">
        <div className="space-y-2 text-xs leading-relaxed">
          <p>
            <span className="label block text-emerald-400 font-semibold mb-0.5">Full profile enables</span>
            Cloud plane · Sensor metadata · presence · scheduled capture · triggered capture · workforce module.
            India: DPDP s.7(i), both limbs. US: company-device policy with notice.
          </p>
          <p>
            <span className="label block text-amber-400 font-semibold mb-0.5">EU standard would disable</span>
            Scheduled capture off; workforce module limited to aggregate reporting. Triggered capture stays —
            dormant until behaviour justifies it.
          </p>
          <p className="text-slate-400 text-[11px] pt-1 border-t border-slate-800">Changing profile is a logged administrative act requiring two approvals.</p>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

