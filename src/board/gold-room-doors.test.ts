import { describe, expect, it } from "vitest";
import { dungeonBoard } from "./dungeon-board.ts";
import { findSpace } from "./find-space.ts";
import { listNeighborSpacesAHeroCanStepTo } from "../movement/list-neighbor-spaces-a-hero-can-step-to.ts";
import { listSpacesByKind } from "./list-spaces.ts";

const INNER_GOLD_ROOMS = [
  "room-west",
  "room-east",
  "room-southeast",
  "room-east-northeast",
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

function openHopCountFromStaircase(targetIdentifier: string): number | undefined {
  const visited = new Set<string>(["main-staircase"]);
  let frontier = ["main-staircase"];
  let hops = 0;

  while (frontier.length > 0) {
    if (visited.has(targetIdentifier) && targetIdentifier !== "main-staircase") {
      return hops;
    }

    const nextFrontier: string[] = [];
    hops += 1;

    for (const spaceIdentifier of frontier) {
      const neighbors = listNeighborSpacesAHeroCanStepTo(
        dungeonBoard,
        spaceIdentifier,
        [],
      );

      for (const neighbor of neighbors) {
        const connection = dungeonBoard.connections.find((candidate) => {
          return (
            candidate.fromSpaceIdentifier === spaceIdentifier &&
            candidate.toSpaceIdentifier === neighbor.identifier &&
            candidate.kind === "open"
          );
        });

        if (connection === undefined) {
          continue;
        }

        if (visited.has(neighbor.identifier) === false) {
          visited.add(neighbor.identifier);
          nextFrontier.push(neighbor.identifier);

          if (neighbor.identifier === targetIdentifier) {
            return hops;
          }
        }
      }
    }

    frontier = nextFrontier;
  }

  return undefined;
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
    for (const roomIdentifier of INNER_GOLD_ROOMS) {
      const stubIdentifier = doorNeighborOf(roomIdentifier);

      expect(stubIdentifier === undefined).toBe(false);
      expect(stubIdentifier === "main-staircase").toBe(false);
      expect(stubIdentifier?.startsWith("corridor-")).toBe(true);

      if (stubIdentifier === undefined) {
        continue;
      }

      const hops = openHopCountFromStaircase(stubIdentifier);
      const openCutFromStart =
        stubIdentifier === "corridor-1252-704" ||
        stubIdentifier === "corridor-1319-730";
      if (openCutFromStart) {
        expect(hops === undefined).toBe(true);
      } else {
        expect(hops === undefined).toBe(false);
        expect((hops ?? 99) <= 2).toBe(true);
      }

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
  });

  it("lets a hero reach all nine gold rooms from the Main Staircase without finding secret doors", () => {
    const start = findSpace(dungeonBoard, "main-staircase");
    expect(start === undefined).toBe(false);

    const reachable = spacesReachableWithoutSecretDoors("main-staircase");
    const goldRooms = listSpacesByKind(dungeonBoard, "room").filter((space) => {
      return space.level === 1;
    });

    expect(goldRooms.length).toBe(9);

    const stillOpenFromStart = [
      "room-north",
      "room-west",
      "room-south",
      "room-southeast",
      "room-east-southeast",
      "room-northwest",
    ];
    const northeastSpoke = [
      "room-northeast",
      "room-east-northeast",
      "room-east",
    ];

    for (const identifier of stillOpenFromStart) {
      expect(
        reachable.has(identifier),
        `${identifier} should be reachable from Start without secret doors`,
      ).toBe(true);
    }
    for (const identifier of northeastSpoke) {
      expect(
        reachable.has(identifier),
        `${identifier} sits on the northeast spoke cut off from Start by gray floor`,
      ).toBe(false);
    }
  });
});
