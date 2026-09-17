import { Camera, Clock, Radio, ShieldCheck } from "lucide-react";
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
        description="Scheduled captures at a fixed cadence, plus captures a behavioural trigger requested. Most frames below are generated; a few applications use a generic reference image instead — either way, no frame is a capture of anyone's actual screen."
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
          label="Employee screens shown"
          value="0"
          sub="generated, or a generic reference image — never a real capture"
        />
      </div>

      <Panel
        bodyClassName="p-0"
        footnote="Under the EU standard profile, scheduled capture is off and only triggered capture remains — dormant until behaviour justifies it. The jurisdiction chip in the sidebar names the active profile. What's collected, what isn't, and how this differs from a risk investigation capture is in the i button below."
      >
        <CaptureGallery />
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
