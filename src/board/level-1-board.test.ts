import { describe, expect, it } from "vitest";
import { level1Board } from "./level-1-board.ts";
import { findSpace } from "./find-space.ts";
import { listNeighborSpacesAHeroCanStepTo } from "./list-neighbor-spaces-a-hero-can-step-to.ts";
import { listSpacesByKind } from "./list-spaces.ts";

const LEVEL_1_ROOM_COUNT = 9;
const LEVEL_1_CHAMBER_COUNT = 1;

const WEST_SECRET_DOOR = {
  fromSpaceIdentifier: "corridor-west-1",
  toSpaceIdentifier: "level-1-room-northwest",
};

const EAST_SECRET_DOOR = {
  fromSpaceIdentifier: "corridor-east-2",
  toSpaceIdentifier: "corridor-east-southeast-1",
};

function neighborIdentifiers(
  spaceIdentifier: string,
  foundSecretDoors: readonly {
    fromSpaceIdentifier: string;
    toSpaceIdentifier: string;
  }[] = [],
): string[] {
  const neighbors = listNeighborSpacesAHeroCanStepTo(
    level1Board,
    spaceIdentifier,
    foundSecretDoors,
  );

  return neighbors.map((space) => space.identifier);
}

describe("Level 1 board", () => {
  it("has nine rooms and one chamber", () => {
    const rooms = listSpacesByKind(level1Board, "room");
    const chambers = listSpacesByKind(level1Board, "chamber");
    const galleries = listSpacesByKind(level1Board, "mainGallery");

    expect(rooms.length).toBe(LEVEL_1_ROOM_COUNT);
    expect(chambers.length + galleries.length).toBe(LEVEL_1_CHAMBER_COUNT);
    expect(galleries.length).toBe(1);
  });

  it("places every Level 1 room on gold level 1", () => {
    const rooms = listSpacesByKind(level1Board, "room");

    for (const room of rooms) {
      expect(room.level).toBe(1);
      expect(room.isSafe).toBe(false);
      expect(room.isStart).toBe(false);
    }
  });

  it("starts the party on the Main Staircase", () => {
    const staircase = findSpace(level1Board, "main-staircase");

    expect(staircase === undefined).toBe(false);
    expect(staircase?.kind).toBe("mainStaircase");
    expect(staircase?.isStart).toBe(true);
    expect(staircase?.level).toBe(1);
  });

  it("treats the Main Gallery as the safe Level 1 chamber", () => {
    const gallery = findSpace(level1Board, "main-gallery");

    expect(gallery === undefined).toBe(false);
    expect(gallery?.kind).toBe("mainGallery");
    expect(gallery?.isSafe).toBe(true);
    expect(gallery?.level).toBe(1);
  });

  it("connects the Main Staircase to Level 1", () => {
    const staircase = findSpace(level1Board, "main-staircase");
    const neighbors = level1Board.connections.filter((connection) => {
      return connection.fromSpaceIdentifier === "main-staircase";
    });

    expect(staircase === undefined).toBe(false);
    expect(neighbors.length > 0).toBe(true);

    for (const connection of neighbors) {
      const neighbor = findSpace(level1Board, connection.toSpaceIdentifier);
      expect(neighbor === undefined).toBe(false);
      expect(neighbor?.level).toBe(1);
    }
  });

  it("joins every connection to two real spaces", () => {
    expect(level1Board.connections.length > 0).toBe(true);

    for (const connection of level1Board.connections) {
      const fromSpace = findSpace(level1Board, connection.fromSpaceIdentifier);
      const toSpace = findSpace(level1Board, connection.toSpaceIdentifier);

      expect(fromSpace === undefined).toBe(false);
      expect(toSpace === undefined).toBe(false);
      expect(
        connection.fromSpaceIdentifier === connection.toSpaceIdentifier,
      ).toBe(false);
    }
  });

  it("records open links, ordinary doors, and secret doors", () => {
    const kinds = new Set(
      level1Board.connections.map((connection) => connection.kind),
    );

    expect(kinds.has("open")).toBe(true);
    expect(kinds.has("door")).toBe(true);
    expect(kinds.has("secretDoor")).toBe(true);
  });

  it("gives every room a door or secret door onto a real space", () => {
    const rooms = listSpacesByKind(level1Board, "room");

    for (const room of rooms) {
      const connection = level1Board.connections.find((candidate) => {
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

  it("links Level 1 stairs toward another level", () => {
    const stairs = listSpacesByKind(level1Board, "stairs");

    expect(stairs.length > 0).toBe(true);

    for (const stair of stairs) {
      expect(stair.level).toBe(1);
      expect(stair.destinationLevel === undefined).toBe(false);
      expect(stair.destinationLevel === 1).toBe(false);
    }
  });
});

describe("hero steps", () => {
  it("blocks the west secret door until the party finds it", () => {
    const beforeFinding = neighborIdentifiers("corridor-west-1");
    const afterFinding = neighborIdentifiers("corridor-west-1", [
      WEST_SECRET_DOOR,
    ]);

    expect(beforeFinding.includes("level-1-room-northwest")).toBe(false);
    expect(afterFinding.includes("level-1-room-northwest")).toBe(true);
  });

  it("lets a hero use the east secret door once it is found", () => {
    const beforeFinding = neighborIdentifiers("corridor-east-2");
    const afterFinding = neighborIdentifiers("corridor-east-2", [
      EAST_SECRET_DOOR,
    ]);

    expect(beforeFinding.includes("corridor-east-southeast-1")).toBe(false);
    expect(afterFinding.includes("corridor-east-southeast-1")).toBe(true);
  });

  it("lets a hero walk through an ordinary door without finding anything", () => {
    const neighbors = neighborIdentifiers("corridor-north-1");

    expect(neighbors.includes("level-1-room-north")).toBe(true);
  });
});
