import type { Board } from "./board.ts";
import type { Space } from "./space.ts";
import type { SpaceKind } from "./space-kind.ts";

export function listSpacesByKind(board: Board, kind: SpaceKind): Space[] {
  return board.spaces.filter((space) => {
    return space.kind === kind;
  });
}
