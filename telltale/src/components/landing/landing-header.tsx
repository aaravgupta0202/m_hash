import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { LogoMark } from "@/components/brand/logo-mark";

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-sm border border-purple/30 bg-purple-lt text-purple">
            <LogoMark className="size-4" />
          </div>
          <span className="text-sm font-semibold tracking-tight text-ink">tellTale</span>
        </Link>

        <nav className="hidden items-center gap-5 text-xs font-medium text-grey sm:flex">
          <a href="#how-it-works" className="hover:text-ink transition-colors">
            How it works
          </a>
          <a href="#modules" className="hover:text-ink transition-colors">
            Modules
          </a>
          <Link href="/demo/about" className="hover:text-ink transition-colors">
            Methodology
          </Link>
        </nav>

        <Link
          href="/demo"
          className="ml-auto flex items-center gap-1.5 rounded-sm bg-purple px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-purple-dk"
        >
          Try the demo
          <ArrowRight className="size-3.5" />
        </Link>
      </div>
    </header>
  );
}
