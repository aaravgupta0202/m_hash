/**
 * Real vendor marks, not generated placeholders. Files under
 * public/brand-icons/ are official logos pulled once by
 * scripts/fetch-brand-icons.mjs (from the Iconify "logos" collection — the
 * same aggregated, freely-licensed set that powers icon pickers in Figma and
 * shields.io) and committed, the same pattern as the seeded fixture
 * generator: fetched by hand, nothing hits the network at build or runtime.
 *
 * Two names have no official mark in that set:
 *   - Workday: hand-drawn monogram, not a downloaded asset — see the SVG.
 *   - iTerm2 / Finder: no entry exists for either specifically, so the
 *     nearest honest stand-in is used (a generic terminal glyph, the macOS
 *     mark) rather than inventing a fake "iTerm2 logo".
 *
 * The map matches on a normalised, keyword-based lookup rather than exact
 * strings, because the same vendor shows up under different names in
 * different fixtures — "GitHub Enterprise" in a connector, "GitHub
 * Enterprise" as an evidence source, "github.repo.clone" nowhere near this
 * lookup at all. Longest keyword wins so "aws cloudtrail" doesn't fall
 * through to a generic "aws" bucket that doesn't exist anyway.
 *
 * Plain data + a pure function, deliberately not "use client" — the
 * composite ribbon (connectors/ribbon.tsx) is a server component and needs
 * this at render time without crossing a client boundary.
 */
const BRAND_MAP: [string, string][] = (
  [
    ["visual studio code", "visual-studio-code"],
    ["vscode", "visual-studio-code"],
    ["google chrome", "chrome"],
    ["chrome", "chrome"],
    ["firefox", "firefox"],
    ["safari", "safari"],
    ["slack", "slack"],
    ["figma", "figma"],
    ["finder", "macos"],
    ["macos", "macos"],
    ["iterm", "terminal"],
    ["terminal", "terminal"],
    ["workday", "workday"],
    ["okta", "okta"],
    ["google workspace", "google"],
    ["gws", "google"],
    ["google", "google"],
    ["github", "github"],
    ["aws cloudtrail", "aws-cloudtrail"],
    ["cloudtrail", "aws-cloudtrail"],
    ["jira", "jira"],
    ["confluence", "confluence"],
    ["pagerduty", "pagerduty"],
    ["dropbox", "dropbox"],
    ["jenkins", "jenkins"],
    ["zendesk", "zendesk"],
  ] as [string, string][]
).sort((a, b) => b[0].length - a[0].length);

export function getBrandSlug(name: string): string {
  const norm = (name || "").toLowerCase().trim();
  for (const [key, slug] of BRAND_MAP) {
    if (norm.includes(key)) return slug;
  }
  return "generic";
}
