import { PageHeader } from "@/components/page-header";
import { Panel } from "@/components/panel";
import { ALL_DOSSIERS, SENSOR_COVERAGE, SUBJECTS, SUPPRESSIONS } from "@/lib/fixtures";

export const metadata = { title: "About this build — tellTale" };

const REAL = [
  ["The detection design", "Context verification, the manufactured-context detector, anchored cohort divergence, the Markov trajectory model and the logistic fusion are designed in full in the master document."],
  ["The mathematics", "Median/MAD robust statistics, order-2 Katz backoff, Jensen–Shannon divergence for composition, CUSUM for slow drift, and the additive log-odds fusion that makes the explanation identical to the model."],
  ["The architecture", "Cloud connectors, the optional endpoint Sensor, the pseudonymisation boundary between the two modules, and the jurisdiction profiles that turn features off by deployment."],
  ["The constraints", "Dual-custody unmasking, metadata-only collection, suppression retention, and the refusal to compute a productivity metric are product positions, not demo shortcuts."],
];

const FIXTURE = [
  ["All data", `${SUBJECTS.length} subjects, ${SUPPRESSIONS.length} suppression rows, one synthetic day. Names, pseudonyms, tickets, repositories and buckets are invented.`],
  ["All scores", `Every risk score, logit contribution, transition probability and Z-score is a literal in a TypeScript fixture. Nothing is computed at runtime — there is no model in this repository.`],
  ["All connector state", "Heartbeats, event volumes and the CloudTrail outage are authored to a fixed clock of 19:59:12Z."],
  ["All captures", "Every thumbnail is drawn from an integer seed. This build contains no image file of any screen."],
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="About"
        title="What this build is, and what it is not"
        description="This is a showcase console for tellTale, built for Manipal Hackathon 2026, Round 1. It is a static frontend with every byte of data hardcoded. It is not the product, and it is worth being precise about the difference."
      />

      <div className="mb-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Panel title="What is real" sub="Designed, specified and defensible — in the master document, not in this repository.">
          <dl className="space-y-3">
            {REAL.map(([k, v]) => (
              <div key={k}>
                <dt className="text-sm font-medium text-ink">{k}</dt>
                <dd className="mt-0.5 text-sm leading-relaxed text-grey">{v}</dd>
              </div>
            ))}
          </dl>
        </Panel>

        <Panel title="What is fixture" sub="Authored to be internally consistent, and nothing more than that." className="border-amber/40">
          <dl className="space-y-3">
            {FIXTURE.map(([k, v]) => (
              <div key={k}>
                <dt className="text-sm font-medium text-ink">{k}</dt>
                <dd className="mt-0.5 text-sm leading-relaxed text-grey">{v}</dd>
              </div>
            ))}
          </dl>
        </Panel>
      </div>

      <Panel
        title="Consistency is authored, not calculated"
        className="mb-4"
        footnote="scripts/verify-fixtures.mjs runs as the first step of npm run build. If any of these relationships drifts, the build fails rather than shipping a number that contradicts the one next to it."
      >
        <p className="max-w-4xl text-sm leading-relaxed text-ink">
          The product claims that a score is not a black box: it decomposes into exact contributions a human
          can check. A demo that prints a contribution table which does not add up argues against its own
          pitch. So every relationship on screen is asserted by a script before the build is allowed to
          proceed.
        </p>
        <ul className="mt-3 grid grid-cols-2 gap-x-10 gap-y-1.5 text-sm text-grey">
          <li>
            <span className="machine text-ink">Σ contributions = logit</span> on all {ALL_DOSSIERS.length}{" "}
            investigation pages
          </li>
          <li>
            <span className="machine text-ink">σ(logit) = P</span>, and <span className="machine text-ink">round(P × 100) = risk</span>
          </li>
          <li>
            <span className="machine text-ink">Z = (x − median) / (1.4826 · MAD)</span>, recomputed from the
            peer array shown on the page
          </li>
          <li>Cohort median and MAD recomputed from the committed peer values</li>
          <li>
            <span className="machine text-ink">expected cost = risk × asset criticality</span>, and the queue
            is sorted by it
          </li>
          <li>Printed session perplexity reproduces the printed trajectory logit</li>
          <li>Dashboard descent reconciles: reason codes sum to the suppression total</li>
          <li>One intercept across every dossier, and no negative coefficient on an anomaly feature</li>
        </ul>
      </Panel>

      <div className="mb-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Panel title="The two modules never mix">
          <p className="text-sm leading-relaxed text-ink">
            The risk module sees pseudonyms — <span className="machine">#4912</span>, never a name. The
            workforce module sees names and carries no risk score. There is no link from a subject to a
            workforce profile anywhere in this build, and crossing between them is a two-approval unmasking
            flow shown as a modal.
          </p>
          <p className="mt-2.5 text-sm leading-relaxed text-grey">
            &quot;Priya&quot;, &quot;Marcus&quot; and &quot;Dana&quot; are presenter shorthand. They appear in
            the demo-scenario launcher and nowhere else in the interface, which is the pseudonymisation
            architecture being visible rather than claimed.
          </p>
        </Panel>

        <Panel title="No productivity classification">
          <p className="text-sm leading-relaxed text-ink">
            Time by category is real telemetry and is reported as such. No category is labelled productive or
            unproductive, no productivity score is computed, and no member is ranked against another.
          </p>
          <p className="mt-2.5 text-sm leading-relaxed text-grey">
            Composition is a behavioural fact; productivity is a management judgement. Letting the second one
            into a risk model is how behavioural security becomes surveillance, so the demo has to show the
            distinction rather than blur it.
          </p>
        </Panel>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.4fr_1fr]">
        <Panel title="Evaluation status">
          <p className="max-w-3xl text-sm leading-relaxed text-ink">
            No accuracy figure appears anywhere in this build, and that is deliberate. A detection design of
            this shape is evaluated on a labelled corpus with an agreed base rate, and that evaluation is
            pending. Quoting a number before running it would be the least defensible thing on the screen.
          </p>
          <p className="mt-2.5 max-w-3xl text-sm leading-relaxed text-grey">
            What the design does commit to is calibration: the fusion layer is calibrated so a score of 93
            means what it says about the population it was fitted on. The master document specifies how, and
            specifies isotonic recalibration on deployment data as part of rollout.
          </p>
        </Panel>

        <Panel title="Build facts" bodyClassName="p-0">
          <dl className="divide-y divide-line">
            {[
              ["Team", "001 — Manipal Hackathon 2026"],
              ["Track", "Cybersecurity, Round 1"],
              ["Stack", "Next.js 16 App Router, static export"],
              ["Data", "TypeScript fixtures, zero runtime fetches"],
              ["Subjects", `${SUBJECTS.length} scored identities`],
              ["Sensor coverage", `${SENSOR_COVERAGE.equipped} of ${SENSOR_COVERAGE.total} endpoints`],
              ["Pinned day", "2026-09-14, 00:00 → 23:59 UTC"],
              ["Network calls", "None. It runs from a plain file server."],
            ].map(([k, v]) => (
              <div key={k} className="flex items-baseline justify-between gap-4 px-4 py-2">
                <dt className="label text-grey">{k}</dt>
                <dd className="machine text-right text-xs text-ink">{v}</dd>
              </div>
            ))}
          </dl>
        </Panel>
      </div>
    </>
  );
}
