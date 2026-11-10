import { buildBoard } from "./build-board.ts";
import { dungeonLinkTuples } from "./map-data/board-links.ts";
import { dungeonTraces } from "./map-data/dungeon-traces.ts";
import { createConnection } from "./connection.ts";
import { spaceFromTrace } from "./expand-traced-space.ts";

export const dungeonBoard = buildBoard(
  dungeonTraces.map(spaceFromTrace),
  dungeonLinkTuples.map((tuple) => {
    return createConnection(tuple[0], tuple[1], tuple[2]);
  }),
);
