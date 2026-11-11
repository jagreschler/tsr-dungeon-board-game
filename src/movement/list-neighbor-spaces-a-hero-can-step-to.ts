import type { Board } from "../board/board.ts";
import type { Connection } from "../board/connection.ts";
import { findSpace } from "../board/find-space.ts";
import type { Space } from "../board/space.ts";

export type FoundSecretDoor = {
  fromSpaceIdentifier: string;
  toSpaceIdentifier: string;
};

export function listNeighborSpacesAHeroCanStepTo(
  board: Board,
  spaceIdentifier: string,
  foundSecretDoors: readonly FoundSecretDoor[],
): Space[] {
  const neighbors: Space[] = [];

  for (const connection of board.connections) {
    if (connection.fromSpaceIdentifier === spaceIdentifier) {
      if (heroMayStepAlong(connection, foundSecretDoors) === false) {
        continue;
      }

      const neighbor = findSpace(board, connection.toSpaceIdentifier);

      if (neighbor !== undefined) {
        neighbors.push(neighbor);
      }
    }
  }

  return neighbors;
}

function heroMayStepAlong(
  connection: Connection,
  foundSecretDoors: readonly FoundSecretDoor[],
): boolean {
  if (connection.kind === "secretDoor") {
    return partyHasFoundSecretDoor(foundSecretDoors, connection);
  }

  return true;
}

function partyHasFoundSecretDoor(
  foundSecretDoors: readonly FoundSecretDoor[],
  connection: Connection,
): boolean {
  return foundSecretDoors.some((found) => {
    const sameDirection =
      found.fromSpaceIdentifier === connection.fromSpaceIdentifier &&
      found.toSpaceIdentifier === connection.toSpaceIdentifier;
    const reverseDirection =
      found.fromSpaceIdentifier === connection.toSpaceIdentifier &&
      found.toSpaceIdentifier === connection.fromSpaceIdentifier;

    return sameDirection || reverseDirection;
  });
}
