/**
 * Reference imagery for a handful of the applications captures cite, pulled
 * once by hand from each vendor's own published documentation or press
 * material and committed under public/capture-screenshots/ — the same
 * fetch-once-and-commit pattern as the brand marks in brand-icons.ts.
 *
 * These are NOT captured screens. They are generic, publicly published
 * illustrations of what the named application looks like, used here so the
 * gallery reads as "a VS Code window" instead of an abstract gradient block.
 * No fixture ties a specific capture to a specific real screen, and no
 * personal or company data appears in any of them — see NOTICE.md in that
 * folder for source and licence per file.
 *
 * Four applications in this build (Slack, Workday, Finder, iTerm2) have no
 * entry here, either because no cleanly-licensed reference image could be
 * sourced (Slack) or because the fixture app is generic/OS-level enough
 * that a generated abstraction is the more honest choice anyway. Those
 * still render through the seeded generator in capture-thumb.tsx, and the
 * capture detail dialog says which kind of image a judge is looking at.
 */
const SCREENSHOTS: Record<string, string[]> = {
  "google chrome": ["/capture-screenshots/chrome.png", "/capture-screenshots/github.png"],
  "visual studio code": ["/capture-screenshots/visual-studio-code.png"],
  figma: ["/capture-screenshots/figma.png"],
};

export function screenshotFor(application: string, seed: number): string | null {
  const key = application.toLowerCase().trim();
  const options = SCREENSHOTS[key];
  if (!options || options.length === 0) return null;
  return options[seed % options.length];
}
