import { describe, expect, it } from "vitest";
import { dungeonBoard } from "../../dungeon-board.ts";
import { dungeonLayout } from "../../dungeon-layout.ts";
import { findPlacement } from "../../find-placement.ts";
import { dungeonTraces } from "../dungeon-traces.ts";

const roomsPerLevel = {
  1: 9,
  2: 9,
  3: 16,
  4: 18,
  5: 16,
  6: 12,
} as const;

const colorByLevel = {
  1: "caramel",
  2: "green",
  3: "orange",
  4: "purple",
  5: "red",
  6: "blue",
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

  it("names every room for its own level, color, and reading-order number", () => {
    const rooms = dungeonBoard.spaces.filter((space) => {
      return space.kind === "room";
    });
    const identifiers = rooms.map((room) => room.identifier);

    expect(new Set(identifiers).size).toBe(identifiers.length);

    for (const levelText of Object.keys(roomsPerLevel)) {
      const level = Number(levelText) as keyof typeof colorByLevel;
      const onLevel = rooms.filter((room) => room.level === level);
      const placed = onLevel.flatMap((room) => {
        const placement = findPlacement(dungeonLayout, room.identifier);
        expect(placement === undefined, room.identifier).toBe(false);
        if (placement === undefined) {
          return [];
        }

        return [{ room, x: placement.x, y: placement.y }];
      });

      placed.sort((left, right) => left.y - right.y || left.x - right.x);

      const levelCode = String(level).padStart(2, "0");
      placed.forEach((entry, index) => {
        const roomNumber = String(index + 1).padStart(2, "0");
        expect(entry.room.identifier).toBe(
          `room-level-${levelCode}-${colorByLevel[level]}-${roomNumber}`,
        );
      });
    }
  });
});
