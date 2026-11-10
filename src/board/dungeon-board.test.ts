import { describe, expect, it } from "vitest";
import { dungeonBoard } from "./dungeon-board.ts";
import { findSpace } from "./find-space.ts";
import { listNeighborSpacesAHeroCanStepTo } from "./list-neighbor-spaces-a-hero-can-step-to.ts";
import { listSpacesByKind } from "./list-spaces.ts";
import type { Level } from "./level.ts";

const ROOMS_PER_LEVEL: Record<Level, number> = {
  1: 9,
  2: 9,
  3: 16,
  4: 18,
  5: 16,
  6: 12,
};

const CHAMBERS_PER_LEVEL: Record<Level, number> = {
  1: 1,
  2: 2,
  3: 2,
  4: 2,
  5: 4,
  6: 2,
};

const NAMED_CHAMBERS = [
  "Main Gallery",
  "Kitchen",
  "Council Room",
  "Armory",
  "Crypt",
  "Storeroom",
  "Torture Chamber",
  "King's Library",
  "King's Treasure Room",
  "Queen's Treasure Room",
  "Queen's Treasure Room Annex",
  "Wizard's Laboratory",
  "Wizard's Treasure Room",
];

function roomsOnLevel(level: Level) {
  return listSpacesByKind(dungeonBoard, "room").filter((space) => {
    return space.level === level;
  });
}

function chambersOnLevel(level: Level) {
  const chambers = listSpacesByKind(dungeonBoard, "chamber");
  const galleries = listSpacesByKind(dungeonBoard, "mainGallery");

  return [...chambers, ...galleries].filter((space) => {
    return space.level === level;
  });
}

describe("dungeon board", () => {
  it("gives every space a level from 1 to 6", () => {
    expect(dungeonBoard.spaces.length > 0).toBe(true);

    for (const space of dungeonBoard.spaces) {
      expect(space.level >= 1).toBe(true);
      expect(space.level <= 6).toBe(true);
    }
  });

  it("matches the Zenopus room counts per level zone", () => {
    for (const level of [1, 2, 3, 4, 5, 6] as const) {
      expect(roomsOnLevel(level).length).toBe(ROOMS_PER_LEVEL[level]);
    }
  });

  it("places thirteen named chambers, with four on level 5", () => {
    for (const level of [1, 2, 3, 4, 5, 6] as const) {
      expect(chambersOnLevel(level).length).toBe(CHAMBERS_PER_LEVEL[level]);
    }
  });

  it("starts the party on the Main Staircase", () => {
    const staircase = findSpace(dungeonBoard, "main-staircase");

    expect(staircase === undefined).toBe(false);
    expect(staircase?.kind).toBe("mainStaircase");
    expect(staircase?.isStart).toBe(true);
    expect(staircase?.level).toBe(1);
    expect(staircase?.printedName).toBe("Main Staircase");
  });

  it("treats the Main Gallery as the safe chamber", () => {
    const gallery = findSpace(dungeonBoard, "main-gallery");

    expect(gallery === undefined).toBe(false);
    expect(gallery?.kind).toBe("mainGallery");
    expect(gallery?.isSafe).toBe(true);
    expect(gallery?.level).toBe(1);
    expect(gallery?.printedName).toBe("Main Gallery");
  });

  it("records the printed chamber names from the 1981 board", () => {
    const printed = dungeonBoard.spaces
      .map((space) => space.printedName)
      .filter((name): name is string => name !== undefined);

    for (const name of NAMED_CHAMBERS) {
      expect(printed.includes(name)).toBe(true);
    }

    expect(printed.includes("Great Hall")).toBe(false);
  });

  it("joins every connection to two real spaces", () => {
    expect(dungeonBoard.connections.length > 0).toBe(true);

    const identifiers = new Set(
      dungeonBoard.spaces.map((space) => space.identifier),
    );

    for (const connection of dungeonBoard.connections) {
      expect(identifiers.has(connection.fromSpaceIdentifier)).toBe(true);
      expect(identifiers.has(connection.toSpaceIdentifier)).toBe(true);
      expect(
        connection.fromSpaceIdentifier === connection.toSpaceIdentifier,
      ).toBe(false);
    }
  });

  it("records open links, ordinary doors, and secret doors", () => {
    const kinds = new Set(
      dungeonBoard.connections.map((connection) => connection.kind),
    );

    expect(kinds.has("open")).toBe(true);
    expect(kinds.has("door")).toBe(true);
    expect(kinds.has("secretDoor")).toBe(true);
  });

  it("gives every room a door or secret door onto a real space", () => {
    const rooms = listSpacesByKind(dungeonBoard, "room");

    for (const room of rooms) {
      const connection = dungeonBoard.connections.find((candidate) => {
        const joinsRoom =
          candidate.fromSpaceIdentifier === room.identifier ||
          candidate.toSpaceIdentifier === room.identifier;
        const isDoor =
          candidate.kind === "door" || candidate.kind === "secretDoor";

        return joinsRoom && isDoor;
      });

      expect(connection === undefined).toBe(false);
    }
  });

  it("links stairs toward another level", () => {
    const stairs = listSpacesByKind(dungeonBoard, "stairs");

    expect(stairs.length > 0).toBe(true);

    for (const stair of stairs) {
      expect(stair.destinationLevel === undefined).toBe(false);
      expect(stair.destinationLevel === stair.level).toBe(false);
    }
  });
});

describe("hero steps", () => {
  it("blocks a secret door until the party finds it", () => {
    const secret = dungeonBoard.connections.find((connection) => {
      return connection.kind === "secretDoor";
    });

    expect(secret === undefined).toBe(false);
    if (secret === undefined) {
      return;
    }

    const beforeFinding = listNeighborSpacesAHeroCanStepTo(
      dungeonBoard,
      secret.fromSpaceIdentifier,
      [],
    );
    const afterFinding = listNeighborSpacesAHeroCanStepTo(
      dungeonBoard,
      secret.fromSpaceIdentifier,
      [secret],
    );

    expect(
      beforeFinding.some((space) => {
        return space.identifier === secret.toSpaceIdentifier;
      }),
    ).toBe(false);
    expect(
      afterFinding.some((space) => {
        return space.identifier === secret.toSpaceIdentifier;
      }),
    ).toBe(true);
  });

  it("lets a hero walk through an ordinary door without finding anything", () => {
    const door = dungeonBoard.connections.find((connection) => {
      return connection.kind === "door";
    });

    expect(door === undefined).toBe(false);
    if (door === undefined) {
      return;
    }

    const neighbors = listNeighborSpacesAHeroCanStepTo(
      dungeonBoard,
      door.fromSpaceIdentifier,
      [],
    );

    expect(
      neighbors.some((space) => {
        return space.identifier === door.toSpaceIdentifier;
      }),
    ).toBe(true);
  });
});
