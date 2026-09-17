import {
  Camera,
  Clock,
  Radio,
  ShieldCheck,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Panel } from "@/components/panel";
import { CaptureGallery } from "@/components/workforce/capture-gallery";
import { CAPTURES } from "@/lib/fixtures";

export const metadata = { title: "Screen captures — tellTale" };

export default function CapturesPage() {
  const triggered = CAPTURES.filter((c) => c.mode === "triggered").length;

  return (
    <>
      <PageHeader
        eyebrow="Workforce module"
        title="Screen captures"
        description="Scheduled captures at a fixed cadence, plus captures a behavioural trigger requested. Every frame below is a generated placeholder — this build contains no image of any real screen."
      />

      <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Stat
          icon={Camera}
          label="Captures today"
          value={String(CAPTURES.length)}
          sub="across enrolled endpoints"
        />
        <Stat
          icon={Clock}
          label="Scheduled"
          value={String(CAPTURES.length - triggered)}
          sub="fixed 5-minute cadence"
        />
        <Stat
          icon={Radio}
          label="Triggered"
          value={String(triggered)}
          sub="requested by a behavioural signal"
        />
        <Stat
          icon={ShieldCheck}
          label="Real imagery"
          value="0"
          sub="every frame is drawn from a seed"
        />
      </div>

      <Panel
        bodyClassName="p-0"
        className="mb-4"
        footnote="Under the EU standard profile, scheduled capture is off and only triggered capture remains — dormant until behaviour justifies it. The jurisdiction chip in the sidebar names the active profile."
      >
        <CaptureGallery />
      </Panel>

      <Panel
        title="What is and is not collected"
        className="border-line bg-white "
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4 text-sm">
          <div className="rounded-sm border border-emerald-200 bg-emerald-50/50 p-3.5">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="size-4 text-emerald-600" />
              <p className="label font-semibold text-emerald-800">Collected</p>
            </div>
            <ul className="space-y-1.5 text-slate-700 text-xs pl-6 list-disc marker:text-emerald-600">
              <li>Frame of the focused window at the capture instant</li>
              <li>Application name, window title, timestamp</li>
              <li>Whether the capture was scheduled or triggered</li>
            </ul>
          </div>
          <div className="rounded-sm border border-red-200 bg-red-50/50 p-3.5">
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="size-4 text-red-600" />
              <p className="label font-semibold text-red-800">
                Never collected
              </p>
            </div>
            <ul className="space-y-1.5 text-slate-700 text-xs pl-6 list-disc marker:text-red-500">
              <li>Keystrokes, clipboard contents, typed text</li>
              <li>Message bodies or file contents</li>
              <li>Anything from a personal device, on any profile</li>
            </ul>
          </div>
        </div>
        <p className="mt-3.5 max-w-4xl text-xs leading-relaxed text-slate-500 border-t border-line pt-3">
          The triggered captures in this gallery are the workforce ones — a
          data-handling rule fired and asked for a frame. Captures requested by
          a risk investigation are different: they are sealed on collection,
          never appear here, and cannot be opened by a workforce administrator.
          Releasing one takes the same two approvals as unmasking, and it is
          released into the investigation rather than into this module.
        </p>
      </Panel>
    </>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="panel px-4 py-3 bg-white border border-line rounded-sm ">
      <div className="flex items-center justify-between">
        <p className="label text-slate-500">{label}</p>
        <Icon className="size-4 text-emerald-600" />
      </div>
      <p className="machine mt-1.5 text-2xl leading-none font-bold text-slate-900">
        {value}
      </p>
      <p className="mt-1.5 text-xs text-slate-500">{sub}</p>
    </div>
  );
}
