import { cn } from "cn";
import { PageHeader } from "@/components/page-header";
import { Panel } from "@/components/panel";
import { ConnectorRibbons } from "@/components/connectors/ribbon";
import { ConnectorStrip, STATE_TEXT } from "@/components/connectors/strip";
import {
  CONNECTORS,
  CONNECTOR_CALLOUT,
  CONNECTOR_INSTANCES,
  NOW,
} from "@/lib/fixtures";

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
            <p className="label text-slate-500 text-[10px]">Evaluated at</p>
            <p className="machine text-xs font-semibold text-emerald-700">
              {NOW.replace("T", " ").replace("Z", " UTC")}
            </p>
          </div>
        }
      />

      {degraded.length > 0 && (
        <div className="panel mb-4 flex items-center gap-4 border border-amber-200 bg-amber-50/70 px-4 py-3 rounded-sm ">
          <span className="label rounded-[4px] border border-amber-300 bg-amber-100 px-2 py-0.5 text-amber-800 font-bold">
            {degraded.length} source behind
          </span>
          <p className="text-xs text-slate-700">
            <span className="font-semibold text-amber-900">
              {degraded.map((c) => c.name).join(", ")}
            </span>{" "}
            stopped reporting inside the evaluation window. Detections that
            depend on this source are marked as degraded rather than silently
            scored on partial data.
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
              <tr className="border-b border-line bg-slate-50">
                {[
                  "Source",
                  "Type",
                  "Timestamp",
                  "Events in window",
                  "Expected band",
                  "Status",
                ].map((h) => (
                  <th
                    key={h}
                    className="label px-4 py-2.5 text-left text-slate-500 text-[10px]"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {CONNECTOR_INSTANCES.map((r, i) => (
                <tr
                  key={i}
                  className={cn(
                    "hover:bg-slate-50 transition-colors",
                    !r.inBand && "bg-amber-50/40",
                  )}
                >
                  <td className="px-4 py-2.5 font-medium text-slate-900">
                    {r.source}
                  </td>
                  <td className="px-4 py-2.5">
                    <span
                      className={cn(
                        "label rounded-[4px] border px-2 py-0.5 text-[10px] font-semibold tracking-wider",
                        r.type === "online"
                          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                          : "border-red-200 bg-red-50 text-red-800",
                      )}
                    >
                      {r.type}
                    </span>
                  </td>
                  <td className="machine px-4 py-2.5 text-xs text-slate-500">
                    {r.ts.replace("T", " ").replace("Z", "")}
                  </td>
                  <td className="machine px-4 py-2.5 text-slate-900 font-semibold">
                    {r.events.toLocaleString("en-US")}
                  </td>
                  <td className="machine px-4 py-2.5 text-xs text-slate-500">
                    {r.expectedBand}
                  </td>
                  <td className="px-4 py-2.5">
                    {r.inBand ? (
                      <span className="label text-emerald-700 font-semibold">
                        in band
                      </span>
                    ) : (
                      <span className="label text-amber-700 font-bold">
                        {r.events === 0 ? "no data" : "below band"}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel title="Why this screen exists" className="border-line bg-white ">
        <p className="max-w-4xl text-xs leading-relaxed text-slate-600">
          {CONNECTOR_CALLOUT}
        </p>
        <ul className="mt-3 space-y-1.5 text-xs text-slate-600">
          <li className="flex items-center gap-2">
            <span
              className={cn(
                "machine font-bold px-1.5 py-0.5 rounded border border-emerald-200 bg-emerald-50",
                STATE_TEXT.healthy,
              )}
            >
              healthy
            </span>
            <span>
              — heartbeat inside configured interval and volume inside learned
              band.
            </span>
          </li>
          <li className="flex items-center gap-2">
            <span
              className={cn(
                "machine font-bold px-1.5 py-0.5 rounded border border-amber-200 bg-amber-50",
                STATE_TEXT.degraded,
              )}
            >
              degraded
            </span>
            <span>
              — reporting, but volume has fallen below band. Detections continue
              and are flagged as partial.
            </span>
          </li>
          <li className="flex items-center gap-2">
            <span
              className={cn(
                "machine font-bold px-1.5 py-0.5 rounded border border-red-200 bg-red-50",
                STATE_TEXT.silent,
              )}
            >
              silent
            </span>
            <span>
              — no heartbeat. Detections that depend on this source are
              suspended rather than scored on absence.
            </span>
          </li>
        </ul>
      </Panel>
    </>
  );
}
