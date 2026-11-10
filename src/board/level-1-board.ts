import { buildBoard } from "./build-board.ts";
import { level1Connections } from "./level-1-connections.ts";
import { level1Doorways } from "./level-1-doorways.ts";
import { level1Spaces } from "./level-1-spaces.ts";

export const level1Board = buildBoard(
  level1Spaces,
  level1Doorways,
  level1Connections,
);
