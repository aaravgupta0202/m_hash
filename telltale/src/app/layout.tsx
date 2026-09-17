import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Shell } from "@/components/shell/shell";
import "./globals.css";

const sans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});
const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "tellTale — Demo Console",
  description: "Context-aware behavioural transition detection. Demo build — all data synthetic.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${sans.variable} ${jetbrains.variable} h-full`}>
      <body className="min-h-full bg-background text-foreground font-sans antialiased selection:bg-emerald-100 selection:text-emerald-900">
        <TooltipProvider delay={150}>
          <Shell>{children}</Shell>
        </TooltipProvider>
      </body>
    </html>
  );
}

