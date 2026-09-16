"use client";

import { useState } from "react";
import { KeyRound, ShieldOff, UserSearch } from "lucide-react";
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
    effect: "Requires 2 of 2 approvals · security grant + HR/legal grant · logged to the case file",
    twoPerson: true,
  },
];

export function ActionButtons({ pseudonym }: { pseudonym: string }) {
  const [open, setOpen] = useState<Action | null>(null);

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {ACTIONS.map((a) => (
          <Button
            key={a.id}
            variant="outline"
            size="sm"
            onClick={() => setOpen(a)}
            className="rounded-sm border-line text-ink hover:bg-purple-lt hover:text-purple"
          >
            <a.Icon className="size-3.5" />
            {a.label}
          </Button>
        ))}
      </div>

      <Dialog open={open !== null} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="rounded-sm ring-line sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{open?.title}</DialogTitle>
            <DialogDescription>{open?.body}</DialogDescription>
          </DialogHeader>

          <div className="space-y-2 px-6">
            <div className="rounded-sm border border-line bg-purple-lt/50 p-3">
              <p className="label text-grey">Would affect</p>
              <p className="machine mt-1 text-xs text-ink">{open?.effect}</p>
              <p className="machine mt-2 text-xs text-grey">subject {pseudonym}</p>
            </div>

            {open?.twoPerson && (
              <div className="grid grid-cols-2 gap-2">
                {["Security approval", "HR / legal approval"].map((g) => (
                  <div key={g} className="rounded-sm border border-dashed border-line p-2.5">
                    <p className="label text-grey">{g}</p>
                    <p className="mt-1 text-xs text-grey">Not granted</p>
                  </div>
                ))}
              </div>
            )}

            <p className="rounded-sm border border-amber/40 bg-amber/5 px-3 py-2 text-xs text-amber">
              Disabled in demo build — this would call the connector.
            </p>
          </div>

          <DialogFooter className="rounded-b-sm">
            <Button variant="outline" onClick={() => setOpen(null)} className="rounded-sm">
              Close
            </Button>
            <Button disabled className="rounded-sm">
              {open?.twoPerson ? "Submit for approval" : "Execute"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
