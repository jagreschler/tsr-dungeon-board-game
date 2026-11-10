import type { Board } from "./board.ts";

export function hasSymmetricConnections(board: Board): boolean {
  for (const connection of board.connections) {
    const reverse = board.connections.find((candidate) => {
      return (
        candidate.fromSpaceIdentifier === connection.toSpaceIdentifier &&
        candidate.toSpaceIdentifier === connection.fromSpaceIdentifier
      );
    });

    if (reverse === undefined) {
      return false;
    }
  }

  return true;
}
