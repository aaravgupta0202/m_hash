/**
 * Ad-hoc inspection, not part of the build. Prints what each queue row's
 * contribution table actually says, so a fixture can be tuned against the
 * assertions in verify-fixtures.mjs rather than by guessing:
 *
 *   node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON scripts/inspect-fixtures.mjs
 *
 * `massNeeded` is the anomaly mass a row must carry to reach its authored risk
 * given the shared intercept and its own context term. If the top three terms
 * do not account for most of it, the residual lands on trajectory surprisal and
 * the Top signal column stops describing the row.
 */
import { register } from "node:module";
import { pathToFileURL } from "node:url";

register("./ts-resolve-hook.mjs", import.meta.url);
const fx = await import(pathToFileURL("./src/lib/fixtures/index.ts").href);

const logit = (p) => Math.log(p / (1 - p));
const GAMMA = { authorised: -2.6, partial: -1.1, absent: 0, suspicious: 2.2 };

for (const r of fx.QUEUE_ROWS) {
  const d = fx.dossierFor(r.id);
  const s = d.comparison.stats;
  const mass = logit(r.risk / 100) + 1.9 - GAMMA[r.verdict];
  const top = d.contributions
    .filter((c) => !c.feature.startsWith("Base") && c.feature !== "Context verification" && c.logit > 0)
    .sort((a, b) => b.logit - a.logit)
    .slice(0, 3)
    .map((x) => `${x.feature} ${x.logit.toFixed(2)}`)
    .join(" | ");

  console.log(
    `${r.pseudonym} ${String(r.risk).padStart(3)} ${r.verdict.padEnd(11)} mass=${mass.toFixed(2).padStart(5)} ` +
      `n=${String(s.n).padStart(2)} median=${String(s.median).padStart(4)} mad=${String(s.mad).padStart(4)} ` +
      `Z=${d.comparison.zScore.toFixed(2).padStart(6)} sensor=${r.sensorEquipped ? "y" : "n"}\n` +
      `        ${r.topSignal}\n        ${top}`,
  );
}
