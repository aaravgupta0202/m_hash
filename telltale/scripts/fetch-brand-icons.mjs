/**
 * Downloads real, full-colour brand logos for the applications and connectors
 * named in the fixtures, from the Iconify "logos" collection — an aggregated,
 * freely-licensed set of official brand marks used across the design-tooling
 * ecosystem (the same source powering icon pickers in Figma, Notion and
 * shields.io). Output is committed like the population generator: this script
 * runs once, by hand, and nothing fetches over the network at build time or
 * runtime.
 *
 *   node scripts/fetch-brand-icons.mjs
 *
 * Two names have no entry in that collection — Workday and iTerm2's exact
 * mark — and get a hand-authored fallback instead of a downloaded file; see
 * workday.svg and the terminal stand-in noted below.
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT = path.resolve("public/brand-icons");

/**
 * name -> iconify slug in the "logos" set. Prefer the icon-only mark over a
 * wordmark (checked by hand against each SVG's viewBox — a near-square
 * viewBox is the icon; a short wide one is a wordmark).
 */
const ICONS = {
  chrome: "chrome",
  firefox: "firefox",
  safari: "safari",
  "visual-studio-code": "visual-studio-code",
  slack: "slack-icon",
  figma: "figma",
  jira: "jira",
  confluence: "confluence",
  github: "github-icon",
  okta: "okta-icon",
  google: "google-icon",
  "aws-cloudtrail": "aws-cloudtrail",
  pagerduty: "pagerduty-icon",
  dropbox: "dropbox",
  jenkins: "jenkins",
  zendesk: "zendesk-icon",
  // Stand-ins: nothing named "Finder" or "iTerm2" exists in this set, so the
  // OS mark and a generic terminal glyph represent them. Documented in
  // brand-icon.tsx next to where each is chosen.
  macos: "macos",
  terminal: "terminal",
};

const BASE = "https://cdn.jsdelivr.net/npm/@iconify-json/logos@1/icons.json";

async function main() {
  await mkdir(OUT, { recursive: true });
  console.log(`fetching ${BASE} ...`);
  const res = await fetch(BASE);
  if (!res.ok) throw new Error(`fetch failed: ${res.status}`);
  const set = await res.json();
  const defaultW = set.width ?? 24;
  const defaultH = set.height ?? 24;

  let written = 0;
  for (const [file, slug] of Object.entries(ICONS)) {
    const icon = set.icons[slug];
    if (!icon) {
      console.error(`  MISSING from icon set: ${slug} (wanted for ${file})`);
      continue;
    }
    const w = icon.width ?? defaultW;
    const h = icon.height ?? defaultH;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">${icon.body}</svg>\n`;
    await writeFile(path.join(OUT, `${file}.svg`), svg, "utf8");
    written += 1;
    console.log(`  ${file}.svg  <-  logos:${slug}  (${w}x${h})`);
  }
  console.log(`\n${written}/${Object.keys(ICONS).length} icons written to public/brand-icons/`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
