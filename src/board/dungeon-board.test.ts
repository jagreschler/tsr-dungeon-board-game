import { describe, expect, it } from "vitest";
import { dungeonBoard } from "./dungeon-board.ts";
import { findSpace } from "./find-space.ts";
import { listNeighborSpacesAHeroCanStepTo } from "./list-neighbor-spaces-a-hero-can-step-to.ts";

describe("dungeon board", () => {
  it("joins every open connection to two real spaces", () => {
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
      expect(connection.kind).toBe("open");
    }
  });
});

describe("hero steps", () => {
  it("lets a hero walk from the Main Staircase into the Main Gallery", () => {
    const staircase = findSpace(dungeonBoard, "main-staircase");

    expect(staircase === undefined).toBe(false);

    const neighbors = listNeighborSpacesAHeroCanStepTo(
      dungeonBoard,
      "main-staircase",
      [],
    );

    expect(
      neighbors.some((space) => {
        return space.identifier === "main-gallery";
      }),
    ).toBe(true);
  });
});
