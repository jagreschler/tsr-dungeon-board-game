import type { Board } from "./board.ts";
import type { Space } from "./space.ts";
import type { SpaceKind } from "./space-kind.ts";

export function listSpacesByKind<Kind extends SpaceKind>(
  board: Board,
  kind: Kind,
): Extract<Space, { kind: Kind }>[] {
  return board.spaces.filter((space): space is Extract<Space, { kind: Kind }> => {
    return space.kind === kind;
  });
}
