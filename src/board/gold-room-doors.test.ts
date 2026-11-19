import { describe, expect, it } from "vitest";
import { dungeonBoard } from "./dungeon-board.ts";
import { findSpace } from "./find-space.ts";
import { listNeighborSpacesAHeroCanStepTo } from "../movement/list-neighbor-spaces-a-hero-can-step-to.ts";
import { listSpacesByKind } from "./list-spaces.ts";

const INNER_GOLD_ROOM_DOORS = [
  ["room-level-01-caramel-05", "corridor-916-921"],
  ["room-level-01-caramel-06", "corridor-1196-1020"],
  ["room-level-01-caramel-02", "corridor-1252-704"],
] as const;

function doorNeighborOf(roomIdentifier: string): string | undefined {
  const door = dungeonBoard.connections.find((connection) => {
    const joinsRoom =
      connection.fromSpaceIdentifier === roomIdentifier ||
      connection.toSpaceIdentifier === roomIdentifier;

    return joinsRoom && connection.kind === "door";
  });

  if (door === undefined) {
    return undefined;
  }

  if (door.fromSpaceIdentifier === roomIdentifier) {
    return door.toSpaceIdentifier;
  }

  return door.fromSpaceIdentifier;
}

function spacesReachableWithoutSecretDoors(startIdentifier: string): Set<string> {
  const visited = new Set<string>([startIdentifier]);
  const queue = [startIdentifier];

  while (queue.length > 0) {
    const spaceIdentifier = queue.shift();
    if (spaceIdentifier === undefined) {
      continue;
    }

    const neighbors = listNeighborSpacesAHeroCanStepTo(
      dungeonBoard,
      spaceIdentifier,
      [],
    );

    for (const neighbor of neighbors) {
      if (visited.has(neighbor.identifier) === false) {
        visited.add(neighbor.identifier);
        queue.push(neighbor.identifier);
      }
    }
  }

  return visited;
}

describe("inner gold room doors", () => {
  it("opens each inner gold room onto the corridor stub in front of it", () => {
    for (const [roomIdentifier, stubIdentifier] of INNER_GOLD_ROOM_DOORS) {
      expect(doorNeighborOf(roomIdentifier)).toBe(stubIdentifier);

      const neighbors = listNeighborSpacesAHeroCanStepTo(
        dungeonBoard,
        stubIdentifier,
        [],
      );

      expect(
        neighbors.some((space) => space.identifier === roomIdentifier),
        `a hero on ${stubIdentifier} should step into ${roomIdentifier}`,
      ).toBe(true);
    }

    expect(doorNeighborOf("room-level-01-caramel-04")).toBe(undefined);
  });

  it("reaches every gold room from Start without a secret door except room-level-01-caramel-04", () => {
    const start = findSpace(dungeonBoard, "main-staircase");
    expect(start === undefined).toBe(false);

    const reachable = spacesReachableWithoutSecretDoors("main-staircase");
    const goldRooms = listSpacesByKind(dungeonBoard, "room").filter((space) => {
      return space.level === 1;
    });

    expect(goldRooms.length).toBe(9);

    const stillOpenFromStart = [
      "room-level-04-purple-09",
      "room-level-01-caramel-05",
      "room-level-01-caramel-09",
      "room-level-01-caramel-06",
      "room-level-01-caramel-07",
      "room-level-01-caramel-03",
    ];
    for (const identifier of stillOpenFromStart) {
      expect(
        reachable.has(identifier),
        `${identifier} should be reachable from Start without secret doors`,
      ).toBe(true);
    }
    for (const identifier of ["room-level-01-caramel-01", "room-level-01-caramel-02"]) {
      expect(
        reachable.has(identifier),
        `${identifier} can be reached the long way around without a secret door`,
      ).toBe(true);
    }
    expect(
      reachable.has("room-level-01-caramel-04"),
      "room-level-01-caramel-04 still needs its secret door",
    ).toBe(false);
  });
});
