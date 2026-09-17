import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { LogoMark } from "@/components/brand/logo-mark";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-5 px-6 text-center">
      <div className="flex size-10 items-center justify-center rounded-sm border border-purple/30 bg-purple-lt text-purple">
        <LogoMark className="size-5" />
      </div>
      <div>
        <p className="label text-purple">404</p>
        <h1 className="mt-1.5 text-xl font-semibold tracking-tight text-ink">
          Nothing lives at this address.
        </h1>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-grey">
          Every route in this build is a fixed page rendered from a fixture — there&rsquo;s no
          server behind it to fall back to. Try the demo instead.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Link
          href="/demo"
          className="flex items-center gap-1.5 rounded-sm bg-purple px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-purple-dk"
        >
          Try the demo
          <ArrowRight className="size-3.5" />
        </Link>
        <Link
          href="/"
          className="flex items-center gap-1.5 rounded-sm border border-line px-3.5 py-2 text-xs font-medium text-ink transition-colors hover:bg-muted"
        >
          Back home
        </Link>
      </div>
      <p className="label mt-2 text-amber-700">Demo build — all data synthetic</p>
    </main>
  );
}
