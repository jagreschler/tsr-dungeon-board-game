import { describe, expect, it } from "vitest";
import { dungeonBoard } from "./dungeon-board.ts";
import { findSpace } from "./find-space.ts";

const printedBoardLevels = [
  ["room-2-01", 3],
  ["room-2-02", 3],
  ["room-2-03", 3],
  ["room-2-04", 3],
  ["room-2-06", 3],
  ["room-2-07", 3],
  ["room-2-08", 3],
  ["room-3-04", 2],
  ["room-3-05", 2],
  ["room-3-06", 2],
  ["room-3-07", 2],
  ["room-3-09", 2],
  ["room-3-10", 2],
  ["room-3-11", 2],
  ["room-4-12", 3],
  ["room-4-17", 3],
  ["room-north", 4],
  ["room-3-03", 4],
  ["room-5-01", 4],
  ["room-5-09", 4],
  ["room-4-06", 1],
  ["room-4-18", 5],
  ["room-3-08", 6],
] as const;

const yellowChambers = ["armory", "kitchen"] as const;

describe("printed board levels", () => {
  it("gives each audited room the level of its printed color", () => {
    for (const [identifier, level] of printedBoardLevels) {
      const space = findSpace(dungeonBoard, identifier);

      expect(space === undefined, identifier).toBe(false);
      expect(space?.kind, identifier).toBe("room");
      if (space?.kind === "room") {
        expect(space.level, identifier).toBe(level);
      }
    }
  });

  it("does not give the Armory or the Kitchen a level", () => {
    for (const identifier of yellowChambers) {
      const space = findSpace(dungeonBoard, identifier);

      expect(space?.kind, identifier).toBe("chamber");
      if (space !== undefined) {
        expect("level" in space, identifier).toBe(false);
      }
    }
  });
});
