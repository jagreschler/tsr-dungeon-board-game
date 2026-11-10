import type { Board } from "./board.ts";
import type { Space } from "./space.ts";

export function findSpace(board: Board, identifier: string): Space | undefined {
  return board.spaces.find((space) => {
    return space.identifier === identifier;
  });
}
