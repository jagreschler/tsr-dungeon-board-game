import type { Board } from "../board/board.ts";
import type { FoundSecretDoor } from "../movement/list-neighbor-spaces-a-hero-can-step-to.ts";

export function everySecretDoor(board: Board): FoundSecretDoor[] {
  const found: FoundSecretDoor[] = [];

  for (const connection of board.connections) {
    if (connection.kind === "secretDoor") {
      found.push({
        fromSpaceIdentifier: connection.fromSpaceIdentifier,
        toSpaceIdentifier: connection.toSpaceIdentifier,
      });
    }
  }

  return found;
}
