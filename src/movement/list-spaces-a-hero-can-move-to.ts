import type { Board } from "../board/board.ts";
import { findSpace } from "../board/find-space.ts";
import type { FoundSecretDoor } from "./list-neighbor-spaces-a-hero-can-step-to.ts";
import { listNeighborSpacesAHeroCanStepTo } from "./list-neighbor-spaces-a-hero-can-step-to.ts";
import { listReachableSpaceIdentifiers } from "./list-reachable-space-identifiers.ts";

export const SPACES_A_HERO_MAY_MOVE = 5;

export function listSpacesAHeroCanMoveTo(
  board: Board,
  fromSpaceIdentifier: string,
  foundSecretDoors: readonly FoundSecretDoor[] = [],
  occupiedSpaceIdentifiers: readonly string[] = [],
): Set<string> {
  return listReachableSpaceIdentifiers(
    fromSpaceIdentifier,
    SPACES_A_HERO_MAY_MOVE,
    {
      neighborsOf: (spaceIdentifier) => {
        return listNeighborSpacesAHeroCanStepTo(
          board,
          spaceIdentifier,
          foundSecretDoors,
        ).map((space) => space.identifier);
      },
      isBlocked: (spaceIdentifier) => {
        return spaceIsBlockedByAnotherPawn(
          board,
          spaceIdentifier,
          fromSpaceIdentifier,
          occupiedSpaceIdentifiers,
        );
      },
      isStoppingSpace: (spaceIdentifier) => {
        return heroMovementEndsAt(board, spaceIdentifier);
      },
    },
  );
}

function heroMovementEndsAt(board: Board, spaceIdentifier: string): boolean {
  const space = findSpace(board, spaceIdentifier);
  if (space === undefined) {
    return false;
  }

  return space.kind === "room" || space.kind === "chamber";
}

function spaceIsBlockedByAnotherPawn(
  board: Board,
  spaceIdentifier: string,
  movingFromSpaceIdentifier: string,
  occupiedSpaceIdentifiers: readonly string[],
): boolean {
  if (spaceIdentifier === movingFromSpaceIdentifier) {
    return false;
  }

  if (occupiedSpaceIdentifiers.includes(spaceIdentifier) === false) {
    return false;
  }

  const space = findSpace(board, spaceIdentifier);
  if (space === undefined) {
    return true;
  }

  if (space.isStart) {
    return false;
  }

  if (space.kind === "chamber" || space.kind === "mainGallery") {
    return false;
  }

  return true;
}
