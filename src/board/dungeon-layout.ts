import { dungeonTraces } from "./map-data/dungeon-traces.ts";
import { placementFromTrace } from "./expand-traced-space.ts";
import type { BoardLayout } from "./space-placement.ts";

export const dungeonLayout: BoardLayout = {
  placements: dungeonTraces.map(placementFromTrace),
};
