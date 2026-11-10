import { buildBoard } from "./build-board";
import { level1Connections } from "./level-1-connections";
import { level1Doorways } from "./level-1-doorways";
import { level1Spaces } from "./level-1-spaces";

export const level1Board = buildBoard(
  level1Spaces,
  level1Doorways,
  level1Connections,
);
