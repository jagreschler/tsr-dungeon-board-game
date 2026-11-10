import type { Board } from "./board";
import type { Space } from "./space";

export function findSpace(board: Board, identifier: string): Space | undefined {
  return board.spaces.find((space) => {
    return space.identifier === identifier;
  });
}
