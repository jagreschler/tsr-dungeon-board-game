import { describe, expect, it } from "vitest";
import { dungeonTraces } from "./dungeon-traces.ts";

const roomsPerLevel = {
  1: 9,
  2: 9,
  3: 16,
  4: 18,
  5: 16,
  6: 12,
} as const;

describe("board rooms", () => {
  it("has the 1981 room count in each zone", () => {
    for (const [levelText, expectedCount] of Object.entries(roomsPerLevel)) {
      const level = Number(levelText);
      const rooms = dungeonTraces.filter((trace) => {
        return trace.kind === "room" && trace.level === level;
      });

      expect(rooms.length).toBe(expectedCount);
    }
  });
});
