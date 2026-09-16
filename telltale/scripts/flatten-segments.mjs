// Works around a Next.js static-export bug on Windows: segment prefetch
// payloads are meant to be flat files (`__next.queue.__PAGE__.txt`), but on
// Windows the exporter builds the segment path with backslashes, so the
// trailing part is written as a subdirectory (`__next.queue/__PAGE__.txt`).
// The client requests the flat name and 404s. This flattens them back.
// No-op on platforms where the export is already correct.
import { promises as fs } from "node:fs";
import path from "node:path";

const OUT = path.resolve(process.argv[2] ?? "out");

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (!entry.isDirectory()) continue;
    if (entry.name.startsWith("__next.")) {
      await flatten(dir, entry.name, full, "");
      await fs.rm(full, { recursive: true, force: true });
    } else {
      await walk(full);
    }
  }
}

async function flatten(routeDir, prefix, dir, rel) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    const nextRel = rel ? `${rel}.${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      await flatten(routeDir, prefix, full, nextRel);
    } else {
      await fs.copyFile(full, path.join(routeDir, `${prefix}.${nextRel}`));
      flattened += 1;
    }
  }
}

let flattened = 0;
await walk(OUT);
console.log(`flatten-segments: ${flattened} segment file(s) flattened in ${OUT}`);
