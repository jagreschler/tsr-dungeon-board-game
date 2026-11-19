import { describe, expect, it } from "vitest";
import { dungeonBoard } from "./dungeon-board.ts";
import { findSpace } from "./find-space.ts";

const printedBoardLevels = [
  ["room-level-03-orange-01", 3],
  ["room-level-03-orange-02", 3],
  ["room-level-03-orange-04", 3],
  ["room-level-03-orange-06", 3],
  ["room-level-03-orange-07", 3],
  ["room-level-03-orange-08", 3],
  ["room-level-03-orange-09", 3],
  ["room-level-02-green-02", 2],
  ["room-level-02-green-03", 2],
  ["room-level-02-green-04", 2],
  ["room-level-02-green-05", 2],
  ["room-level-02-green-07", 2],
  ["room-level-02-green-08", 2],
  ["room-level-02-green-09", 2],
  ["room-level-03-orange-12", 3],
  ["room-level-03-orange-15", 3],
  ["room-level-04-purple-09", 4],
  ["room-level-04-purple-08", 4],
  ["room-level-04-purple-01", 4],
  ["room-level-04-purple-06", 4],
  ["room-level-01-caramel-08", 1],
  ["room-level-05-red-16", 5],
  ["room-level-06-blue-12", 6],
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
