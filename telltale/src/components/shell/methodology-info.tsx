"use client";

import { useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
import { normalisePath } from "@/lib/nav";

/**
 * A small "i" button, fixed bottom-left of the main content area on every
 * page (the Demo launcher already owns bottom-right), replacing what used to
 * be a scatter of static "What this is for" / "Why this screen exists" boxes
 * sitting permanently in the page body on connectors, workforce and captures.
 * Those boxes said the same handful of things on every visit whether a judge
 * wanted them or not; this puts the same words one click away instead, and —
 * because the content below is keyed to the current route — each page gets
 * its own explanation rather than one generic methodology essay repeated
 * everywhere.
 *
 * It sits just past the sidebar rather than at the literal viewport corner
 * — the sidebar's own footer already has content pinned to its bottom-left
 * (the honesty badge, "About this build"), and a page-fixed button there
 * sat on top of it. Tracking the sidebar's collapsed state keeps the two
 * from touching either way it's toggled.
 */
export function MethodologyInfo() {
  const { collapsed } = useSidebar();
  const pathname = usePathname();
  const scrollRef = useRef<HTMLDivElement>(null);
  const content = contentFor(pathname);

  if (!content) return null;

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
            title="How this page works"
            className={cn(
              // On mobile the demo launcher becomes a full-width bar along
              // the very bottom (see demo-launcher.tsx), so this sits one
              // row above it there; on lg+ the launcher is a compact
              // right-aligned pill and this can drop back to bottom-4.
              "fixed bottom-16 left-4 z-40 flex size-9 items-center justify-center rounded-full border border-line bg-white text-grey shadow-lg transition-[left] duration-200 hover:border-purple/40 hover:text-purple lg:bottom-4",
              collapsed ? "lg:left-20" : "lg:left-68",
            )}
          />
        }
      >
        <Info className="size-4.5" />
        <span className="sr-only">How this page works</span>
      </DialogTrigger>

      <DialogContent
        ref={scrollRef}
        className="max-h-[85vh] max-w-full overflow-y-auto rounded-sm sm:max-w-2xl"
      >
        <DialogHeader>
          <DialogTitle>{content.title}</DialogTitle>
          <DialogDescription>{content.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-5 px-6 pb-2 text-sm leading-relaxed text-ink">
          {content.sections.map((s) => (
            <Section key={s.title} title={s.title}>
              {s.body}
            </Section>
          ))}
        </div>

        <div className="border-t border-line px-6 py-3 text-xs text-grey">
          <Link href="/demo/about" className="font-medium text-purple hover:underline">
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

interface InfoContent {
  title: string;
  description: string;
  sections: { title: string; body: React.ReactNode }[];
}

function contentFor(pathname: string): InfoContent | null {
  const p = normalisePath(pathname);

  if (p === "/demo/about") return null;

  if (p.startsWith("/demo/workforce/captures")) return CAPTURES_INFO;
  if (p.startsWith("/demo/workforce")) return WORKFORCE_INFO;
  if (p.startsWith("/demo/connectors")) return CONNECTORS_INFO;
  if (p.startsWith("/demo/suppressions")) return SUPPRESSIONS_INFO;
  return RISK_SCORE_INFO;
}

const RISK_SCORE_INFO: InfoContent = {
  title: "How this works",
  description:
    "The maths behind every score on screen, condensed. Every number below is reproducible from the evidence printed beside it on an investigation page — that reproducibility is checked by a script before this build is allowed to ship.",
  sections: [
    {
      title: "The score is a sum, not a black box",
      body: (
        <>
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
        </>
      ),
    },
    {
      title: "Context verification — four tests, not a checkbox",
      body: (
        <>
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
        </>
      ),
    },
    {
      title: "Robust statistics — median and MAD, not mean and standard deviation",
      body: (
        <>
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
        </>
      ),
    },
    {
      title: "Trajectory surprisal — how unusual is the path, not just the destination",
      body: (
        <p>
          An order-2 Markov model over action sequences, fitted per organisation, gives every
          transition an empirical probability: how often does <span className="machine">B</span>{" "}
          follow <span className="machine">A</span> here, historically? A transition with{" "}
          <span className="machine">P = 0.0004</span> is the claim &ldquo;about four times in ten
          thousand transitions of this shape, in this organisation&rdquo; — not a guess, a frequency.
          Session perplexity is the geometric mean of those inverse probabilities across a session: a
          perplexity of 12 reads as &ldquo;about one session in twelve looks like this.&rdquo;
        </p>
      ),
    },
    {
      title: "The queue sorts by expected cost, on purpose",
      body: (
        <p>
          <span className="machine">expected cost = risk × asset criticality</span>. A 0.55 probability
          on production credentials can rank above an 0.80 on a marketing folder — that inversion is
          intentional, and it is the single most interesting thing on the queue page.
        </p>
      ),
    },
    {
      title: "What's real, and what's fixture",
      body: (
        <p>
          The detection design, the statistics and the architecture are specified in full in the
          master document. Every number this build displays — every score, contribution, transition
          probability and Z-score — is a literal written into a TypeScript fixture file. Nothing is
          computed at runtime; there is no model running behind this interface. No accuracy figure
          appears anywhere, because that evaluation has not been run yet, and stating one before it
          has would be the least defensible thing on the screen.
        </p>
      ),
    },
  ],
};

const SUPPRESSIONS_INFO: InfoContent = {
  title: "How suppression works",
  description:
    "Suppressed is not the same as discarded. Every alert a context record explained away is logged here with the record that explained it, and any of them can be reopened.",
  sections: [
    {
      title: "A suppression is a claim, and the claim is checked",
      body: (
        <p>
          An anomaly is only suppressed when an operational record passes all four context tests —
          precedence, provenance, scope match and proportionality. Expand any row to see the exact
          record examined: who created it, when, and what scope it claims. Nothing is deleted when a
          row is suppressed — it stays queryable, which is what makes reopening possible at all.
        </p>
      ),
    },
    {
      title: "The reopened row is the one that matters",
      body: (
        <p>
          A suppression can rest on a record the subject created and assigned to themselves — a record
          that exists, but fails provenance. When the manufactured-context detector catches that, the
          suppression is reopened and the anomaly is re-scored with the context term inverted from a
          discount to a penalty. That reopened row links straight through to the investigation it
          feeds, because the mechanism that hid the anomaly is the same mechanism that surfaced it
          again — this is not two separate systems.
        </p>
      ),
    },
    {
      title: "Reading the reason chips",
      body: (
        <p>
          Each chip above the table is a context reason code — the specific operational fact that
          explained an anomaly away (an on-call rotation, a scope-matched ticket, approved travel, a
          role change). Filtering by one shows every alert that reason accounted for; the count on
          each chip is exact, and the four reason codes sum to the suppression total shown on the
          dashboard.
        </p>
      ),
    },
  ],
};

const CONNECTORS_INFO: InfoContent = {
  title: "How connector health works",
  description:
    "Every source is watched two ways at once: is it reporting at all, and is it reporting the right amount.",
  sections: [
    {
      title: "Silence is a signal, not a gap in the data",
      body: (
        <p>
          An attacker who disables a log source produces silence, and silence is monitored as actively
          as data. Every connector carries a dead-man heartbeat and an expected-volume band, so a
          source that stops reporting — or reports far less than it should — raises an alert of its
          own rather than just quietly going missing from the count.
        </p>
      ),
    },
    {
      title: "The three states",
      body: (
        <ul className="space-y-1.5">
          <li>
            <b className="text-emerald-700">Healthy</b> — heartbeat inside its configured interval and
            volume inside the learned band.
          </li>
          <li>
            <b className="text-amber-700">Degraded</b> — still reporting, but volume has fallen below
            band. Detections that depend on it continue, flagged as partial.
          </li>
          <li>
            <b className="text-red-700">Silent</b> — no heartbeat at all. Detections that depend on it
            are suspended rather than scored on an absence they can&apos;t see.
          </li>
        </ul>
      ),
    },
    {
      title: "A window inside its band isn't proof of health on its own",
      body: (
        <p>
          It&apos;s evidence the volume is ordinary. The heartbeat is what actually establishes a source is
          alive — the two checks are independent on purpose, so a source can&apos;t fake health by staying
          quiet in a way that happens to look like a normal quiet day.
        </p>
      ),
    },
  ],
};

const WORKFORCE_INFO: InfoContent = {
  title: "How the workforce module works",
  description:
    "Named employees, working time and activity — and, deliberately, no risk score anywhere in this module.",
  sections: [
    {
      title: "This module answers operational questions",
      body: (
        <p>
          Who was working, on what, for how long, and with what coverage. It&apos;s named, because a
          working-time record that can&apos;t be attributed to anyone isn&apos;t a working-time record. Working
          and idle time come from endpoint input activity, not from which application was open —
          nothing here labels an application productive or unproductive, and no member is ranked
          against another.
        </p>
      ),
    },
    {
      title: "Two identity spaces, kept apart on purpose",
      body: (
        <p>
          The risk module answers a different question and uses a different identity space — it&apos;s
          pseudonymous, and it never sees this screen. That separation is the product, not a setting:
          behavioural risk analysis doesn&apos;t need to know who anyone is until a human being decides it
          does, and that decision takes two approvals, logged as an audited action.
        </p>
      ),
    },
  ],
};

const CAPTURES_INFO: InfoContent = {
  title: "How screen captures work",
  description:
    "Scheduled captures at a fixed cadence, plus captures a behavioural trigger requested. Most frames are generated; a few applications show a generic vendor reference image instead — either way, no frame is a capture of anyone's actual screen.",
  sections: [
    {
      title: "What is and isn't collected",
      body: (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
          <div>
            <p className="label mb-1 text-emerald-700">Collected</p>
            <ul className="space-y-1 text-xs">
              <li>Frame of the focused window at the capture instant</li>
              <li>Application name, window title, timestamp</li>
              <li>Whether the capture was scheduled or triggered</li>
            </ul>
          </div>
          <div>
            <p className="label mb-1 text-red-700">Never collected</p>
            <ul className="space-y-1 text-xs">
              <li>Keystrokes, clipboard contents, typed text</li>
              <li>Message bodies or file contents</li>
              <li>Anything from a personal device, on any profile</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      title: "This gallery is not where an investigation capture goes",
      body: (
        <p>
          The triggered captures here are the workforce ones — a data-handling rule fired and asked
          for a frame. A capture requested by a risk investigation is different: it&apos;s sealed on
          collection, never appears in this gallery, and can&apos;t be opened by a workforce administrator.
          Releasing one takes the same two approvals as unmasking, and it&apos;s released into the
          investigation rather than into this module.
        </p>
      ),
    },
  ],
};
