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

      <div className="mb-4 grid grid-cols-4 gap-4">
        <Stat label="Captures today" value={String(CAPTURES.length)} sub="across enrolled endpoints" />
        <Stat label="Scheduled" value={String(CAPTURES.length - triggered)} sub="fixed 5-minute cadence" />
        <Stat label="Triggered" value={String(triggered)} sub="requested by a behavioural signal" />
        <Stat label="Real imagery" value="0" sub="every frame is drawn from a seed" />
      </div>

      <Panel
        bodyClassName="p-0"
        className="mb-4"
        footnote="Under the EU standard profile, scheduled capture is off and only triggered capture remains — dormant until behaviour justifies it. The jurisdiction chip in the sidebar names the active profile."
      >
        <CaptureGallery />
      </Panel>

      <Panel title="What is and is not collected" className="border-purple/30 bg-purple-lt/40">
        <div className="grid grid-cols-2 gap-x-10 gap-y-2 text-sm">
          <div>
            <p className="label mb-1.5 text-purple">Collected</p>
            <ul className="space-y-1 text-grey">
              <li>Frame of the focused window at the capture instant</li>
              <li>Application name, window title, timestamp</li>
              <li>Whether the capture was scheduled or triggered</li>
            </ul>
          </div>
          <div>
            <p className="label mb-1.5 text-purple">Never collected</p>
            <ul className="space-y-1 text-grey">
              <li>Keystrokes, clipboard contents, typed text</li>
              <li>Message bodies or file contents</li>
              <li>Anything from a personal device, on any profile</li>
            </ul>
          </div>
        </div>
        <p className="mt-3 max-w-4xl text-sm leading-relaxed text-ink">
          The triggered captures in this gallery are the workforce ones — a data-handling rule fired and asked
          for a frame. Captures requested by a risk investigation are different: they are sealed on
          collection, never appear here, and cannot be opened by a workforce administrator. Releasing one
          takes the same two approvals as unmasking, and it is released into the investigation rather than
          into this module.
        </p>
      </Panel>
    </>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="panel px-4 py-3">
      <p className="label text-grey">{label}</p>
      <p className="machine mt-1 text-2xl leading-none font-semibold text-purple">{value}</p>
      <p className="mt-1.5 text-xs text-grey">{sub}</p>
    </div>
  );
}
