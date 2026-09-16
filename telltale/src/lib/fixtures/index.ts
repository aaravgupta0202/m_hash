export * from "./types";
export * from "./population";
export * from "./queue";
export * from "./queue-dossiers";
export * from "./dossiers";
export * from "./queue-timelines";
export * from "./timelines";
export * from "./connectors";
export * from "./suppressions";
export * from "./dashboard";
export * from "./workforce";

import { DOSSIERS } from "./dossiers";
import { QUEUE_DOSSIERS } from "./queue-dossiers";
import type { Dossier } from "./types";

/** Every subject with an investigation page: the three scenarios plus the queue. */
export const ALL_DOSSIERS: Dossier[] = [...DOSSIERS, ...QUEUE_DOSSIERS];

export function dossierFor(subjectId: string): Dossier | undefined {
  return ALL_DOSSIERS.find((d) => d.subjectId === subjectId);
}

/** Pseudonym without the '#', for route params. */
export function routeIdFor(subjectId: string): string {
  return subjectId.replace("subject_", "");
}
