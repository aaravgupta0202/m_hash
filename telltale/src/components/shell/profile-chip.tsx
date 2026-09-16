"use client";

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
            className="flex w-full items-center justify-between rounded-sm border border-line px-2 py-1.5 text-left hover:bg-purple-lt"
          />
        }
      >
        <span className="label text-grey">Profile</span>
        <span className="machine text-xs font-medium text-purple">FULL (INDIA/US)</span>
      </TooltipTrigger>
      <TooltipContent side="right" align="end" className="max-w-72 bg-purple-dk p-3 text-white [&_*]:fill-purple-dk">
        <div className="space-y-2 text-xs leading-relaxed">
          <p>
            <span className="label block text-white/60">Full profile enables</span>
            Cloud plane · Sensor metadata · presence · scheduled capture · triggered capture · workforce module.
            India: DPDP s.7(i), both limbs. US: company-device policy with notice.
          </p>
          <p>
            <span className="label block text-white/60">EU standard would disable</span>
            Scheduled capture off; workforce module limited to aggregate reporting. Triggered capture stays —
            dormant until behaviour justifies it.
          </p>
          <p className="text-white/60">Changing profile is a logged administrative act requiring two approvals.</p>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
