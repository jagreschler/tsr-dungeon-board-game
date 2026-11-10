import type { Board } from "./board";
import type { Space } from "./space";
import type { SpaceKind } from "./space-kind";

export function listSpacesByKind(board: Board, kind: SpaceKind): Space[] {
  return board.spaces.filter((space) => {
    return space.kind === kind;
  });
}
