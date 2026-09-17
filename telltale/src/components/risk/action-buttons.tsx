"use client";

import { useState } from "react";
import {
  KeyRound,
  ShieldOff,
  UserSearch,
  Lock,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/**
 * PRD §5.3A: three actions, each opening a modal that explains what would
 * happen. Nothing is wired to anything.
 *
 * Unmasking is deliberately shaped differently from the other two: it is a
 * two-approval flow and is rendered as two named grants, never one button
 * (PRD §7.6). This is also the only place a workforce identity is referred to
 * from the risk module, and it refers to the *process*, not to a person — there
 * is no link and no name.
 */
interface Action {
  id: string;
  label: string;
  Icon: typeof ShieldOff;
  title: string;
  body: string;
  effect: string;
  twoPerson?: boolean;
}

const ACTIONS: Action[] = [
  {
    id: "revoke",
    label: "Revoke sessions",
    Icon: ShieldOff,
    title: "Revoke all active sessions",
    body: "Calls Okta to terminate every live session for this subject and forces re-authentication with a step-up factor. Existing OAuth grants are unaffected — that is the next action.",
    effect: "6 active sessions · 2 devices · 1 commercial VPN egress",
  },
  {
    id: "tokens",
    label: "Restrict tokens",
    Icon: KeyRound,
    title: "Restrict issued tokens",
    body: "Narrows the scopes on this subject's GitHub and AWS tokens to read-only and revokes the personal access token used in the flagged trajectory. Reversible by a second analyst.",
    effect: "3 tokens in scope · 1 PAT created 11d ago",
  },
  {
    id: "unmask",
    label: "Request unmasking",
    Icon: UserSearch,
    title: "Request identity unmasking",
    body: "Resolves this pseudonym to a named workforce identity. This is the only operation that crosses the two modules, and it is never a single action: it requires a security approval and an independent HR or legal approval, both recorded against the case with a stated reason.",
    effect:
      "Requires 2 of 2 approvals · security grant + HR/legal grant · logged to the case file",
    twoPerson: true,
  },
];

export function ActionButtons({ pseudonym }: { pseudonym: string }) {
  const [open, setOpen] = useState<Action | null>(null);

  return (
    <>
      <div className="flex flex-col gap-1.5">
        {ACTIONS.map((a) => (
          <Button
            key={a.id}
            variant="outline"
            size="sm"
            onClick={() => setOpen(a)}
            className="w-full justify-start gap-2 rounded-sm border-line bg-white text-xs font-medium text-slate-700 hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-800 transition-all"
          >
            <a.Icon className="size-3.5 text-emerald-600 shrink-0" />
            <span className="truncate">{a.label}</span>
          </Button>
        ))}
      </div>

      <Dialog open={open !== null} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="rounded-sm border border-line bg-white text-slate-900 shadow-2xl sm:max-w-lg z-50">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-sm border border-emerald-200 bg-emerald-50 text-emerald-600">
                {open && <open.Icon className="size-4" />}
              </div>
              <DialogTitle className="text-slate-900 text-base font-semibold">
                {open?.title}
              </DialogTitle>
            </div>
            <DialogDescription className="text-slate-600 text-xs leading-relaxed pt-2">
              {open?.body}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 px-6 py-2">
            <div className="rounded-sm border border-line bg-slate-50 p-3">
              <p className="label text-emerald-800 text-[10px] font-bold">
                Target Impact
              </p>
              <p className="machine mt-1 text-xs text-slate-800">
                {open?.effect}
              </p>
              <p className="machine mt-2 text-xs text-slate-600">
                Target:{" "}
                <span className="text-emerald-700 font-semibold">
                  {pseudonym}
                </span>
              </p>
            </div>

            {open?.twoPerson && (
              <div className="grid grid-cols-2 gap-2.5">
                {["Security approval", "HR / legal approval"].map((g) => (
                  <div
                    key={g}
                    className="rounded-sm border border-dashed border-line bg-slate-50/50 p-2.5"
                  >
                    <p className="label text-slate-500 text-[10px]">{g}</p>
                    <p className="mt-1 text-xs text-amber-700 font-semibold flex items-center gap-1">
                      <Lock className="size-3" />
                      Pending grant
                    </p>
                  </div>
                ))}
              </div>
            )}

            <div className="rounded-sm border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 flex items-center gap-2">
              <AlertTriangle className="size-4 shrink-0 text-amber-600" />
              <span>
                Disabled in demo build — this would call the connector.
              </span>
            </div>
          </div>

          <DialogFooter className="mt-1">
            <Button
              variant="outline"
              onClick={() => setOpen(null)}
              className="border-line bg-slate-100 text-slate-700 hover:bg-slate-200"
            >
              Close
            </Button>
            <Button
              disabled
              className="border border-line bg-slate-100 text-slate-400 opacity-60 cursor-not-allowed"
            >
              {open?.twoPerson ? "Submit for approval" : "Execute action"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
