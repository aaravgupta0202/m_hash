"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { BrandIcon } from "@/components/brand-icon";
import { categoryColor, fmtHours } from "@/components/workforce/bits";

interface AppUsageItem {
  application: string;
  minutes: number;
  category: string;
  titles: number;
}

export function AppUsageTable({
  items,
  topMinutes,
}: {
  items: AppUsageItem[];
  topMinutes: number;
}) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"duration" | "name" | "category">("duration");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = useMemo(() => {
    return ["all", ...Array.from(new Set(items.map((i) => i.category)))];
  }, [items]);

  const filtered = items.filter((a) => {
    if (selectedCategory !== "all" && a.category !== selectedCategory) return false;
    if (query.trim()) {
      const q = query.toLowerCase();
      return (
        a.application.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const sorted = useMemo(() => {
    const out = [...filtered];
    if (sort === "name") return out.sort((a, b) => a.application.localeCompare(b.application));
    if (sort === "category") return out.sort((a, b) => a.category.localeCompare(b.category));
    return out.sort((a, b) => b.minutes - a.minutes);
  }, [filtered, sort]);

  return (
    <div>
      {/* Search and Sort Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-line bg-slate-50/70 px-4 py-2">
        <div className="relative flex items-center">
          <Search className="absolute left-2.5 size-3 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search application or category..."
            className="h-7 w-52 rounded-sm border border-line bg-white pl-7 pr-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="h-7 rounded border border-line bg-white px-2 text-xs text-slate-700 capitalize focus:border-emerald-600 focus:outline-none"
          >
            {categories.map((c) => (
              <option key={c} value={c} className="capitalize">
                {c === "all" ? "All categories" : c}
              </option>
            ))}
          </select>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as any)}
            className="h-7 rounded border border-line bg-white px-2 text-xs text-slate-700 focus:border-emerald-600 focus:outline-none"
          >
            <option value="duration">Highest duration</option>
            <option value="name">App name (A-Z)</option>
            <option value="category">Category</option>
          </select>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        <table className="w-full border-collapse text-sm">
          <thead className="sticky top-0 bg-slate-50 z-10">
            <tr className="border-b border-line">
              {["Application", "Category", "Titles", "Duration", ""].map((h) => (
                <th key={h} className="label px-4 py-2.5 text-left text-slate-500 text-[10px]">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-xs text-slate-500">
                  No applications match your search.
                </td>
              </tr>
            )}
            {sorted.map((a) => (
              <tr
                key={a.application}
                className="border-b border-line hover:bg-slate-50 transition-colors"
              >
                <td className="px-4 py-2 font-medium text-slate-900">
                  <div className="flex items-center gap-2">
                    <BrandIcon name={a.application} className="size-4" />
                    <span>{a.application}</span>
                  </div>
                </td>
                <td className="px-4 py-2">
                  <span className="flex items-center gap-1.5 text-xs text-slate-700 capitalize">
                    <span
                      className="size-2 rounded-sm"
                      style={{ backgroundColor: categoryColor(a.category) }}
                    />
                    {a.category}
                  </span>
                </td>
                <td className="machine px-4 py-2 text-xs text-slate-500">
                  {a.titles}
                </td>
                <td className="machine px-4 py-2 font-semibold text-emerald-700">
                  {fmtHours(a.minutes)}
                </td>
                <td className="w-32 px-4 py-2">
                  <div className="h-3 w-full rounded bg-slate-100 border border-line overflow-hidden">
                    <div
                      className="bar-grow h-3 rounded"
                      style={{
                        width: `${(a.minutes / topMinutes) * 100}%`,
                        backgroundColor: categoryColor(a.category),
                      }}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
