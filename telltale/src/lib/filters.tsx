"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/**
 * PRD §4: the universal filter triple. Cohort and subject filter the queue for
 * real; the date range is display-only and pinned to one synthetic day.
 *
 * State lives in React context and nowhere else — no localStorage, no cookies,
 * no URL rewriting (PRD §9). It resets on reload, which is correct for a demo.
 */
export const ALL_COHORTS = "All cohorts";
export const ALL_SUBJECTS = "All subjects";
export const ALL_TEAMS = "All teams";
export const ALL_MEMBERS = "All members";

interface FilterState {
  cohort: string;
  subject: string;
  team: string;
  member: string;
  set: (patch: Partial<Omit<FilterState, "set" | "reset">>) => void;
  reset: () => void;
}

const DEFAULTS = {
  cohort: ALL_COHORTS,
  subject: ALL_SUBJECTS,
  team: ALL_TEAMS,
  member: ALL_MEMBERS,
};

const FilterContext = createContext<FilterState | null>(null);

export function FilterProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(DEFAULTS);
  const value = useMemo<FilterState>(
    () => ({
      ...state,
      set: (patch) => setState((prev) => ({ ...prev, ...patch })),
      reset: () => setState(DEFAULTS),
    }),
    [state],
  );
  return (
    <FilterContext.Provider value={value}>{children}</FilterContext.Provider>
  );
}

export function useFilters(): FilterState {
  const ctx = useContext(FilterContext);
  if (!ctx) throw new Error("useFilters must be used inside FilterProvider");
  return ctx;
}
