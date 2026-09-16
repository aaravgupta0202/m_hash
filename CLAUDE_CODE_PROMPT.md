# Claude Code prompt — tellTale demo console

Paste the block below into Claude Code in an empty directory, with `PRD.md` already present in
that directory. Run it with Fable 5.1 or Opus 5 — either is more than sufficient; this is a
well-specified frontend build, not a reasoning problem.

---

## The prompt

````
Read PRD.md in this directory before writing any code. It is the specification for this build and
it is authoritative — where anything below conflicts with it, the PRD wins.

## What we're building

A static showcase console for tellTale, an insider-threat detection product. It is a hackathon
demo: every byte of data is hardcoded, there is no backend, and nothing is computed at runtime.
Its job is to make a three-minute video look like a real security product and to survive a judge
clicking around afterwards.

Stack: Next.js 16 App Router, TypeScript strict, Tailwind, shadcn/ui, Recharts, React Flow,
`output: 'export'`.

## How I want you to work

Follow the build order in PRD.md §11. Each step unblocks the next — do not jump ahead to the
visually interesting parts before the fixtures are right.

At the end of each numbered step, stop and show me what you did before starting the next one.
I would rather correct direction at step 3 than at step 8.

Before you write anything, give me your plan for step 1 and wait for my go-ahead.

Prefer complete files over diffs when you're changing something substantial — I'd rather read the
whole file than reconstruct it in my head.

If something in the PRD is ambiguous or you think it's wrong, say so and propose an alternative.
Don't silently pick an interpretation. If I ask for something that contradicts the PRD's
non-goals, push back rather than accommodating it.

## The things that actually matter

Most of this build is routine. Four things are not, and they're where I want your attention:

1. **The fixtures must be arithmetically consistent.** Contribution values sum to the stated
   logit; the logit maps through the logistic to the stated probability; probability × 100 is
   the displayed risk; Z-scores agree with the cohort median and MAD shown on the same page.
   Write a small script that asserts all of this and run it. A judge who spots a mismatch has
   found the one thing that discredits the product's central claim of being explainable.

2. **The composite timeline (PRD §5.3B) is the centrepiece.** Four lanes sharing one hour axis,
   hand-built SVG, not a chart library — four aligned lanes with a shared scale is not a shape
   any chart library wants to make, and fighting one will cost more than writing it. Budget more
   time here than anywhere else. The story has to be readable without narration: Marcus's CONTEXT
   lane is empty exactly where his TRAJECTORY lane is busiest.

3. **The queue sorts by expected cost, not risk** (PRD §5.2), so row 2 has a higher raw risk than
   row 1. That inversion is intentional and is the most interesting thing on the page. Don't
   "fix" it.

4. **The two-module separation in PRD §7 is the hard constraint.** The app has a risk module
   (pseudonymous subjects, scores, dossiers) and a workforce module (named employees, working time,
   usage, captures). They must never appear on the same screen, there is no link from a subject to
   their workforce profile, and no category is ever labelled "productive" or "unproductive".

   This is not squeamishness. The product's legal and commercial argument is that composition of
   work is a behavioural signal while productivity is a management judgement that must not touch a
   risk model. A demo that blurs the two argues against the pitch a judge just heard. If you find
   yourself adding a productivity score because a workforce dashboard feels thin, stop and ask me.

## Design

Palette and typography are in PRD §8 — use them exactly. Purple dominant, red used sparingly.

The one typographic rule worth internalising: monospace for anything machine-generated
(timestamps, action tokens, resource IDs, probabilities), sans for anything human-written. That
distinction does a lot of work in a security tool and should be applied consistently.

This is an analyst tool, not a landing page. Dense, bordered cards, minimal motion, no shadows.
Don't add gradients, hero sections, or marketing flourishes.

## Verification

After each visual step, run the build and check the pages actually render — don't tell me a
screen is done based on the code alone. Watch for text overflow, misaligned columns, and the
timeline lanes drifting out of alignment with each other, which is the defect most likely to
appear and most likely to be missed.

Before you declare the build finished, walk PRD.md §12 line by line and tell me the status of
each item. Don't mark anything green you haven't actually looked at.

## Start

Read the PRD, then give me your step 1 plan.
````

---

## Notes on using this

**Have the PRD in the directory first.** The prompt is deliberately short because the PRD carries
the detail. Pasting the prompt without the file will produce a generic dashboard.

**The stop-at-each-step instruction matters.** A model given this whole spec at once will build
all nine steps and present a finished app, and if the fixture arithmetic is wrong at step 2 you
will find out at step 9. Checkpointing costs a few minutes and saves the rebuild.

**Expect to spend your own time on the timeline component.** It is the piece most likely to need
two or three rounds of iteration, because "does this read correctly at a glance" is a judgement
call a model cannot make for you. Look at it, say what's wrong in plain language, and let it
adjust.

**Keep the repo public** — §6.4 of the rulebook forfeits all prototype bonus points for a private
or inaccessible repository. Check it in an incognito window before submitting, same as the video.

**If you later want it deployed:** `output: 'export'` produces a static `out/` directory that
serves from GitHub Pages, Vercel, Netlify, or `python -m http.server`. For the in-person round,
run it locally — venue wifi should not be in the critical path of your demo.
