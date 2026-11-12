import { describe, expect, it } from "vitest";
import { dungeonBoard } from "./dungeon-board.ts";
import { findSpace } from "./find-space.ts";
import { isUnclearedLevel1Room } from "./is-uncleared-level-1-room.ts";

describe("isUnclearedLevel1Room", () => {
  it("is true only for Level 1 rooms", () => {
    expect(isUnclearedLevel1Room(findSpace(dungeonBoard, "room-south"))).toBe(
      true,
    );
    expect(isUnclearedLevel1Room(findSpace(dungeonBoard, "room-2-01"))).toBe(
      false,
    );
  });

  it("is false for Start, the Main Gallery, corridors, and chambers", () => {
    expect(
      isUnclearedLevel1Room(findSpace(dungeonBoard, "main-staircase")),
    ).toBe(false);
    expect(isUnclearedLevel1Room(findSpace(dungeonBoard, "main-gallery"))).toBe(
      false,
    );
    expect(
      isUnclearedLevel1Room(findSpace(dungeonBoard, "corridor-1098-942")),
    ).toBe(false);
    expect(isUnclearedLevel1Room(findSpace(dungeonBoard, "kitchen"))).toBe(
      false,
    );
  });
});
