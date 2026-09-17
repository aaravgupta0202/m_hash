"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("telltale-theme");
    if (stored === "dark") {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    } else {
      document.documentElement.classList.remove("dark");
      setIsDark(false);
    }
  }, []);

  const toggle = () => {
    if (isDark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("telltale-theme", "light");
      setIsDark(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("telltale-theme", "dark");
      setIsDark(true);
    }
  };

  if (!mounted) {
    return (
      <div className={`h-8 w-8 rounded-md border border-line bg-white opacity-0 ${className}`} />
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-label="Toggle theme"
      className={`inline-flex h-8 items-center justify-center gap-1.5 rounded-md border border-line bg-white px-2.5 text-xs font-medium text-slate-700 shadow-2xs transition-colors hover:bg-slate-50 hover:text-emerald-700 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-emerald-400 ${className}`}
    >
      {isDark ? (
        <>
          <Sun className="size-3.5 text-amber-400 fill-amber-400/20" />
          <span className="text-[11px] font-medium hidden sm:inline">Light</span>
        </>
      ) : (
        <>
          <Moon className="size-3.5 text-slate-600" />
          <span className="text-[11px] font-medium hidden sm:inline">Dark</span>
        </>
      )}
    </button>
  );
}
