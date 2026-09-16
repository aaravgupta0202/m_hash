import { cn } from "cn";
import { PageHeader } from "@/components/page-header";
import { Panel } from "@/components/panel";
import { ConnectorRibbons } from "@/components/connectors/ribbon";
import { ConnectorStrip, STATE_TEXT } from "@/components/connectors/strip";
import { CONNECTORS, CONNECTOR_CALLOUT, CONNECTOR_INSTANCES, NOW } from "@/lib/fixtures";

export const metadata = { title: "Connector health — tellTale" };

export default function ConnectorsPage() {
  const degraded = CONNECTORS.filter((c) => c.state !== "healthy");

  return (
    <>
      <PageHeader
        eyebrow="Risk module"
        title="Connector health"
        description="Every source carries a dead-man heartbeat and an expected-volume band. A source that stops reporting raises an alert of its own."
        right={
          <div className="text-right">
            <p className="label text-grey">Evaluated at</p>
            <p className="machine text-sm text-ink">{NOW.replace("T", " ").replace("Z", " UTC")}</p>
          </div>
        }
      />

      {degraded.length > 0 && (
        <div className="panel mb-4 flex items-center gap-4 border-amber/50 bg-amber/5 px-4 py-3">
          <span className="label rounded-sm border border-amber/50 bg-white px-1.5 py-0.5 text-amber">
            {degraded.length} source behind
          </span>
          <p className="text-sm text-ink">
            {degraded.map((c) => c.name).join(", ")} stopped reporting inside the evaluation window.
            Detections that depend on this source are marked as degraded rather than silently scored on
            partial data.
          </p>
        </div>
      )}

      <Panel title="Sources" bodyClassName="p-0" className="mb-4">
        <ConnectorStrip href="#instances" />
      </Panel>

      <Panel
        title="Continuous coverage"
        sub="Reported state per source across the pinned day. Silence is drawn, not inferred from a missing row."
        bodyClassName="p-0"
        className="mb-4"
      >
        <ConnectorRibbons />
      </Panel>

      <Panel
        title="Ingest instances"
        sub="Event volume per polling window against the band learned from the preceding four weeks."
        bodyClassName="p-0"
        className="mb-4"
        footnote="A window inside its band is not evidence of health on its own — it is evidence that the volume is ordinary. The heartbeat is what establishes the source is alive."
      >
        <div id="instances" className="overflow-x-auto">
          <table className="w-full min-w-[820px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-line">
                {["Source", "Type", "Timestamp", "Events in window", "Expected band", ""].map((h) => (
                  <th key={h} className="label px-4 py-2 text-left text-grey">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CONNECTOR_INSTANCES.map((r, i) => (
                <tr key={i} className={cn("border-b border-line/70", !r.inBand && "bg-amber/4")}>
                  <td className="px-4 py-2 text-ink">{r.source}</td>
                  <td className="px-4 py-2">
                    <span
                      className={cn(
                        "label rounded-sm border px-1.5 py-0.5",
                        r.type === "online"
                          ? "border-green/40 bg-green/8 text-green"
                          : "border-red/40 bg-red/8 text-red",
                      )}
                    >
                      {r.type}
                    </span>
                  </td>
                  <td className="machine px-4 py-2 text-xs text-grey">
                    {r.ts.replace("T", " ").replace("Z", "")}
                  </td>
                  <td className="machine px-4 py-2 text-ink">{r.events.toLocaleString("en-US")}</td>
                  <td className="machine px-4 py-2 text-xs text-grey">{r.expectedBand}</td>
                  <td className="px-4 py-2">
                    {r.inBand ? (
                      <span className="label text-green">in band</span>
                    ) : (
                      <span className="label text-amber">{r.events === 0 ? "no data" : "below band"}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel title="Why this screen exists" className="border-purple/30 bg-purple-lt/40">
        <p className="max-w-4xl text-sm leading-relaxed text-ink">{CONNECTOR_CALLOUT}</p>
        <ul className="mt-3 space-y-1.5 text-sm text-grey">
          <li>
            <span className={cn("machine", STATE_TEXT.healthy)}>healthy</span> — heartbeat inside the
            configured interval and volume inside the learned band.
          </li>
          <li>
            <span className={cn("machine", STATE_TEXT.degraded)}>degraded</span> — reporting, but the
            volume has fallen below the band. Detections continue and are flagged as partial.
          </li>
          <li>
            <span className={cn("machine", STATE_TEXT.silent)}>silent</span> — no heartbeat. Detections
            that depend on this source are suspended rather than scored on absence.
          </li>
        </ul>
      </Panel>
    </>
  );
}
