import { describe, expect, it } from "vitest";
import { dungeonBoard } from "./dungeon-board.ts";
import { findSpace } from "./find-space.ts";
import { isOccupiedLevel1Room } from "./is-occupied-level-1-room.ts";

describe("isOccupiedLevel1Room", () => {
  it("is true only for Level 1 rooms", () => {
    expect(isOccupiedLevel1Room(findSpace(dungeonBoard, "room-south"))).toBe(
      true,
    );
    expect(isOccupiedLevel1Room(findSpace(dungeonBoard, "room-2-01"))).toBe(
      false,
    );
  });

  it("is false for Start, the Main Gallery, corridors, and chambers", () => {
    expect(
      isOccupiedLevel1Room(findSpace(dungeonBoard, "main-staircase")),
    ).toBe(false);
    expect(isOccupiedLevel1Room(findSpace(dungeonBoard, "main-gallery"))).toBe(
      false,
    );
    expect(
      isOccupiedLevel1Room(findSpace(dungeonBoard, "corridor-1098-942")),
    ).toBe(false);
    expect(isOccupiedLevel1Room(findSpace(dungeonBoard, "kitchen"))).toBe(
      false,
    );
  });
});
