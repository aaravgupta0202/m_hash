import type { Metadata } from "next";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Shell } from "@/components/shell/shell";

export const metadata: Metadata = {
  title: "tellTale — Demo Console",
  description:
    "Context-aware behavioural transition detection. Demo build — all data synthetic.",
};

export default function DemoLayout({ children }: LayoutProps<"/demo">) {
  return (
    <TooltipProvider delay={150}>
      <Shell>{children}</Shell>
    </TooltipProvider>
  );
}
