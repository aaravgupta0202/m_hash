import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { LogoMark } from "@/components/brand/logo-mark";
import { ThemeToggle } from "@/components/theme-toggle";

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white/95 backdrop-blur dark:bg-slate-950/95 dark:border-slate-800">
      <div className="mx-auto flex h-16 w-full max-w-[1600px] items-center gap-6 px-6 sm:px-10 lg:px-16">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white font-black text-xs shadow-xs">
            <LogoMark />
          </div>
          <span className="text-base font-bold tracking-tight text-slate-900">tellTale</span>
        </Link>

        <div className="hidden md:flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
          <span className="size-1.5 rounded-full bg-emerald-500" />
          Made by Team 001 for M# 2026
        </div>

        <nav className="hidden items-center gap-6 text-xs font-medium text-slate-600 lg:flex ml-4">
          <a href="#how-it-works" className="hover:text-emerald-700 transition-colors">
            Overview
          </a>
          <a href="#detection-core" className="hover:text-emerald-700 transition-colors">
            Primitives
          </a>
          <a href="#scenarios" className="hover:text-emerald-700 transition-colors">
            3-User Proof
          </a>
          <a href="#modules" className="hover:text-emerald-700 transition-colors">
            Two Modules
          </a>
          <a href="#pricing" className="hover:text-emerald-700 transition-colors">
            Pricing
          </a>
          <Link href="/demo/about" className="hover:text-emerald-700 transition-colors">
            Methodology
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/demo"
            className="flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-emerald-700"
          >
            Try the demo
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
