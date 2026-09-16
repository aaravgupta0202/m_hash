import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Panel } from "@/components/panel";
import { ConnectorStrip } from "@/components/connectors/strip";
import { NoiseBar } from "@/components/dashboard/noise-bar";
import { RiskTrend } from "@/components/dashboard/risk-trend";
import {
  DASHBOARD_LEDE,
  NOISE_FOOTNOTE,
  SENSOR_COVERAGE,
  STAT_TILES,
  SUBJECTS,
} from "@/lib/fixtures";

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        eyebrow="Risk module"
        title="Detection overview"
        description={DASHBOARD_LEDE}
        right={
          <Link
            href="/queue"
            className="flex items-center gap-1.5 rounded-sm bg-purple px-3 py-2 text-sm font-medium text-white hover:bg-purple-dk"
          >
            Open the queue
            <ArrowRight className="size-3.5" />
          </Link>
        }
      />

      {/* Row 1 — the descent from a million events to three findings. */}
      <div className="mb-4 grid grid-cols-4 gap-4">
        {STAT_TILES.map((t, i) => (
          <div key={t.label} className="panel relative px-4 py-3.5">
            <p className="label text-grey">{t.label}</p>
            <p className="machine mt-1.5 text-3xl leading-none font-semibold text-purple">{t.value}</p>
            <p className="mt-2 text-xs leading-relaxed text-grey">{t.sub}</p>
            {i < STAT_TILES.length - 1 && (
              <ArrowRight className="absolute top-1/2 -right-3 z-10 size-4 -translate-y-1/2 bg-white text-line" />
            )}
          </div>
        ))}
      </div>

      {/* Row 2 — where the noise went, and what the month looked like. */}
      <div className="mb-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Panel
          title="Where the noise went"
          sub="Every anomaly raised in the last 30 days, by what explained it. Suppressed is not the same as discarded — each one is logged with the record that suppressed it."
          bodyClassName="p-0"
          footnote={NOISE_FOOTNOTE}
        >
          <NoiseBar />
        </Panel>

        <Panel
          title="Risk over the last 30 days"
          sub="Peak calibrated risk across the organisation per day. Flat is the expected shape — a behavioural model that spikes daily is a model nobody reads."
          bodyClassName="p-0"
          footnote="Three findings this month. Click one to open its investigation."
        >
          <RiskTrend />
        </Panel>
      </div>

      {/* Row 3 — our own telemetry. */}
      <Panel
        title="Connector health"
        sub="Six sources, each with a dead-man heartbeat. One is behind."
        right={
          <Link href="/connectors" className="text-xs text-purple hover:underline">
            Connector detail →
          </Link>
        }
        bodyClassName="p-0"
        footnote={`Coverage: ${SENSOR_COVERAGE.equipped} of ${SENSOR_COVERAGE.total} scored identities carry the endpoint Sensor. The remaining ${
          SENSOR_COVERAGE.total - SENSOR_COVERAGE.equipped
        } are cloud-only and are scored on the cloud plane alone, with two detectors unavailable and marked as such on their investigation pages.`}
      >
        <ConnectorStrip />
      </Panel>

      <p className="mt-4 text-xs leading-relaxed text-grey">
        {SUBJECTS.length} identities are in scope on the pinned synthetic day. Nothing on this screen is
        computed at runtime — every figure is a fixture, and the relationships between them are asserted by a
        verifier that runs as part of the build.
      </p>
    </>
  );
}
