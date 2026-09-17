"use client";

import { useRef } from "react";
import Link from "next/link";
import { Info } from "lucide-react";
import { cn } from "cn";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useSidebar } from "./shell";

/**
 * A small "i" button, fixed bottom-left of the main content area on every
 * page (the Demo launcher already owns bottom-right), opening the same
 * explanation that used to require a trip to /about — the maths behind a
 * score, in one place a judge can reach without losing whatever page they
 * were reading.
 *
 * It sits just past the sidebar rather than at the literal viewport corner
 * — the sidebar's own footer already has content pinned to its bottom-left
 * (the honesty badge, "About this build"), and a page-fixed button there
 * sat on top of it. Tracking the sidebar's collapsed state keeps the two
 * from touching either way it's toggled.
 *
 * The content below is a condensed version of /about; that page is still
 * the fuller version and this dialog links out to it.
 */
export function MethodologyInfo() {
  const { collapsed } = useSidebar();
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <Dialog
      onOpenChange={(open) => {
        // Base UI moves focus into the popup on open, and on a long
        // scrollable dialog that drags scroll position down to whatever
        // picked up focus first — one rAF wasn't enough to win the race
        // against it, so this resets on a few frames to be sure the title
        // is what's visible on open, not a mid-page sentence.
        if (!open) return;
        for (const delay of [0, 50, 150]) {
          setTimeout(() => scrollRef.current?.scrollTo({ top: 0 }), delay);
        }
      }}
    >
      <DialogTrigger
        render={
          <button
            type="button"
            title="How this works"
            className={cn(
              "fixed bottom-4 z-40 flex size-9 items-center justify-center rounded-full border border-line bg-white text-grey shadow-lg transition-[left] duration-200 hover:border-purple/40 hover:text-purple",
              collapsed ? "left-20" : "left-68",
            )}
          />
        }
      >
        <Info className="size-4.5" />
        <span className="sr-only">How this works</span>
      </DialogTrigger>

      <DialogContent
        ref={scrollRef}
        className="max-h-[85vh] max-w-full overflow-y-auto rounded-sm sm:max-w-2xl"
      >
        <DialogHeader>
          <DialogTitle>How this works</DialogTitle>
          <DialogDescription>
            The maths behind every score on screen, condensed. Every number below is reproducible from
            the evidence printed beside it on an investigation page — that reproducibility is checked by
            a script before this build is allowed to ship.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 px-6 pb-2 text-sm leading-relaxed text-ink">
          <Section title="The score is a sum, not a black box">
            <p>
              Each detector contributes a signed number to a log-odds total — a <em>logit</em>. Positive
              raises risk, negative lowers it. The logit passes through the logistic function{" "}
              <span className="machine rounded-sm bg-purple-lt px-1 py-0.5 text-purple">
                P = 1 / (1 + e⁻ˡᵒᵍⁱᵗ)
              </span>{" "}
              to a probability, and the displayed risk is that probability × 100. There is no separate
              attribution step run after the fact — the contribution table <em>is</em> the model, not an
              explanation bolted onto one.
            </p>
            <p className="mt-2 text-xs text-grey">
              One intercept (β₀ = −1.90) is shared by every subject. It is a prior over scored identities:
              3 confirmed findings out of 23 investigations in the last 30 days, read straight off the
              dashboard — not a tuned constant with no source.
            </p>
          </Section>

          <Section title="Context verification — four tests, not a checkbox">
            <ul className="mt-1 space-y-1.5">
              <li>
                <b>Precedence</b> — did an operational record exist before the activity, not after?
              </li>
              <li>
                <b>Provenance</b> — was it created by someone other than the subject?
              </li>
              <li>
                <b>Scope match</b> — does the record&rsquo;s stated scope actually resolve to the
                resources touched?
              </li>
              <li>
                <b>Proportionality</b> — is the volume plausible for the scope of work the record
                describes?
              </li>
            </ul>
            <p className="mt-2">
              A record that exists and fails provenance — created by the subject it would authorise — is
              not neutral. It moves the context term from a discount (−2.60) to a penalty (+2.20), because
              manufacturing your own authorisation is itself the strongest signal on the page.
            </p>
          </Section>

          <Section title="Robust statistics — median and MAD, not mean and standard deviation">
            <p>
              A cohort&rsquo;s ordinary behaviour is described by its median and its median absolute
              deviation (MAD), not a mean and a standard deviation — a mean is dragged around by the one
              person who happens to touch 400 resources in a day; a median isn&rsquo;t. Distance from that
              baseline is a robust Z-score:
            </p>
            <p className="mt-1.5 machine rounded-sm bg-purple-lt px-2 py-1 text-purple">
              Z = (x − median) / (1.4826 × MAD)
            </p>
            <p className="mt-2 text-xs text-grey">
              The 1.4826 constant makes MAD comparable to a standard deviation under a normal
              distribution, which is what lets a Z-score here mean roughly what a Z-score means anywhere
              else.
            </p>
          </Section>

          <Section title="Trajectory surprisal — how unusual is the path, not just the destination">
            <p>
              An order-2 Markov model over action sequences, fitted per organisation, gives every
              transition an empirical probability: how often does <span className="machine">B</span>{" "}
              follow <span className="machine">A</span> here, historically? A transition with{" "}
              <span className="machine">P = 0.0004</span> is the claim &ldquo;about four times in ten
              thousand transitions of this shape, in this organisation&rdquo; — not a guess, a frequency.
              Session perplexity is the geometric mean of those inverse probabilities across a session: a
              perplexity of 12 reads as &ldquo;about one session in twelve looks like this.&rdquo;
            </p>
          </Section>

          <Section title="The queue sorts by expected cost, on purpose">
            <p>
              <span className="machine">expected cost = risk × asset criticality</span>. A 0.55 probability
              on production credentials can rank above an 0.80 on a marketing folder — that inversion is
              intentional, and it is the single most interesting thing on the queue page.
            </p>
          </Section>

          <Section title="What's real, and what's fixture">
            <p>
              The detection design, the statistics and the architecture are specified in full in the
              master document. Every number this build displays — every score, contribution, transition
              probability and Z-score — is a literal written into a TypeScript fixture file. Nothing is
              computed at runtime; there is no model running behind this interface. No accuracy figure
              appears anywhere, because that evaluation has not been run yet, and stating one before it
              has would be the least defensible thing on the screen.
            </p>
          </Section>
        </div>

        <div className="border-t border-line px-6 py-3 text-xs text-grey">
          <Link href="/about" className="font-medium text-purple hover:underline">
            Read the full write-up →
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="label mb-1.5 text-ink">{title}</h3>
      <div className="text-[13px] leading-relaxed text-ink">{children}</div>
    </section>
  );
}
