import { describe, expect, it } from "vitest";
import { level1Board } from "./level-1-board.ts";
import { findSpace } from "./find-space.ts";
import { hasSymmetricConnections } from "./has-symmetric-connections.ts";
import { listSpacesByKind } from "./list-spaces.ts";

const LEVEL_1_ROOM_COUNT = 9;
const LEVEL_1_CHAMBER_COUNT = 1;

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

  it("keeps every adjacency symmetric", () => {
    expect(hasSymmetricConnections(level1Board)).toBe(true);
  });

  it("joins every doorway to two real spaces", () => {
    expect(level1Board.doorways.length > 0).toBe(true);

    for (const doorway of level1Board.doorways) {
      const fromSpace = findSpace(level1Board, doorway.fromSpaceIdentifier);
      const toSpace = findSpace(level1Board, doorway.toSpaceIdentifier);

      expect(fromSpace === undefined).toBe(false);
      expect(toSpace === undefined).toBe(false);
      expect(doorway.fromSpaceIdentifier === doorway.toSpaceIdentifier).toBe(
        false,
      );
    }
  });

  it("records both ordinary doors and secret doors", () => {
    const ordinaryDoors = level1Board.doorways.filter((doorway) => {
      return doorway.kind === "door";
    });
    const secretDoors = level1Board.doorways.filter((doorway) => {
      return doorway.kind === "secretDoor";
    });

    expect(ordinaryDoors.length > 0).toBe(true);
    expect(secretDoors.length > 0).toBe(true);
  });

  it("gives every room a doorway onto a real space", () => {
    const rooms = listSpacesByKind(level1Board, "room");

    for (const room of rooms) {
      const doorway = level1Board.doorways.find((candidate) => {
        return (
          candidate.fromSpaceIdentifier === room.identifier ||
          candidate.toSpaceIdentifier === room.identifier
        );
      });

      expect(doorway === undefined).toBe(false);
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
