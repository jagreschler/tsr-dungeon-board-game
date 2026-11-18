import { describe, expect, it } from "vitest";
import { dungeonBoard } from "../board/dungeon-board.ts";
import {
  listMoveStepCounts,
  listSpacesAHeroCanMoveTo,
} from "./list-spaces-a-hero-can-move-to.ts";
import { wallSeparatedSpacePairs } from "./wall-separated-space-pairs.ts";

describe("listSpacesAHeroCanMoveTo", () => {
  it("lets a hero step through an ordinary door at no extra cost", () => {
    const reachable = listSpacesAHeroCanMoveTo(
      dungeonBoard,
      "main-staircase",
      [],
    );

    expect(reachable.has("corridor-1098-942")).toBe(true);
    expect(reachable.has("room-south")).toBe(true);
  });

  it("blocks every secret door while none are found", () => {
    const fromTreasure = listSpacesAHeroCanMoveTo(
      dungeonBoard,
      "wizards-treasure-room",
      [],
    );
    const fromRoomEast = listSpacesAHeroCanMoveTo(
      dungeonBoard,
      "room-east",
      [],
    );

    expect(fromTreasure.has("wizards-laboratory")).toBe(true);
    expect(fromTreasure.has("corridor-1828-214")).toBe(true);
    expect(fromTreasure.has("corridor-1764-226")).toBe(false);
    expect(fromTreasure.has("corridor-1709-223")).toBe(false);
    expect(fromRoomEast.has("corridor-1319-730")).toBe(false);
    expect(fromRoomEast.has("corridor-1417-864")).toBe(false);
  });

  it("stops in a room or chamber and does not continue past it", () => {
    const reachable = listSpacesAHeroCanMoveTo(
      dungeonBoard,
      "main-staircase",
      [],
    );

    expect(reachable.has("room-south")).toBe(true);
    expect(reachable.has("room-west")).toBe(false);
    const pastTheKitchen = listSpacesAHeroCanMoveTo(
      dungeonBoard,
      "corridor-338-786",
      [],
    );
    expect(pastTheKitchen.has("kitchen")).toBe(true);
    expect(pastTheKitchen.has("corridor-338-1028")).toBe(false);
  });

  it("can pass through the Main Staircase and the Main Gallery", () => {
    const reachable = listSpacesAHeroCanMoveTo(
      dungeonBoard,
      "corridor-1098-942",
      [],
    );

    expect(reachable.has("main-staircase")).toBe(true);
    expect(reachable.has("main-gallery")).toBe(true);
    expect(reachable.has("corridor-1045-800")).toBe(true);
  });

  it.each(wallSeparatedSpacePairs)(
    "does not jump walls from $fromSpaceIdentifier to $toSpaceIdentifier",
    ({ fromSpaceIdentifier, toSpaceIdentifier }) => {
      const reachable = listSpacesAHeroCanMoveTo(
        dungeonBoard,
        fromSpaceIdentifier,
        [],
      );

      expect(reachable.has(toSpaceIdentifier)).toBe(false);
    },
  );

  it("does not reach skip-link squares more than five spaces from Start", () => {
    const reachable = listSpacesAHeroCanMoveTo(
      dungeonBoard,
      "main-staircase",
      [],
    );

    expect(reachable.has("corridor-926-664")).toBe(false);
    expect(reachable.has("corridor-1176-1177")).toBe(false);
    expect(reachable.has("corridor-1204-1177")).toBe(false);
    expect(reachable.has("corridor-836-966")).toBe(false);
    expect(reachable.has("corridor-1190-1139")).toBe(false);
    expect(reachable.has("corridor-1436-640")).toBe(false);
    expect(reachable.has("corridor-1512-872")).toBe(false);
    expect(reachable.has("corridor-792-768")).toBe(false);
    expect(reachable.has("corridor-839-887")).toBe(false);
    expect(reachable.has("corridor-887-972")).toBe(false);
    expect(reachable.has("corridor-934-689")).toBe(false);
    expect(reachable.has("room-3-04")).toBe(false);
    expect(reachable.has("corridor-1482-762")).toBe(false);
    expect(reachable.has("corridor-1491-803")).toBe(false);
    expect(reachable.has("corridor-1499-850")).toBe(false);
    expect(reachable.has("corridor-869-893")).toBe(false);
  });

  it("labels the Main Gallery as one step and the old Start exits as two", () => {
    const steps = listMoveStepCounts(dungeonBoard, "main-staircase", []);

    expect(steps.get("main-gallery")).toBe(1);
    expect(steps.get("corridor-1098-942")).toBe(2);
    expect(steps.get("corridor-1045-800")).toBe(2);
    expect(steps.has("stairs-west")).toBe(false);
  });

  it("walks the southwest gold squares one step farther because of the gallery", () => {
    const steps = listMoveStepCounts(dungeonBoard, "main-staircase", []);

    expect(steps.get("corridor-1098-942")).toBe(2);
    expect(steps.get("corridor-1057-974")).toBe(3);
    expect(steps.get("corridor-1018-1011")).toBe(4);
    expect(steps.get("corridor-966-968")).toBe(5);
    expect(steps.has("corridor-916-921")).toBe(false);
    expect(steps.has("room-4-06")).toBe(false);
    expect(steps.has("corridor-869-893")).toBe(false);
  });

  it("does not reach the east gold square or the level-6 hall in five steps", () => {
    const reachable = listSpacesAHeroCanMoveTo(
      dungeonBoard,
      "main-staircase",
      [],
    );

    expect(reachable.has("corridor-1433-817")).toBe(false);
    expect(reachable.has("corridor-1438-716")).toBe(false);
    expect(reachable.has("corridor-1429-681")).toBe(false);
    expect(reachable.has("corridor-1482-762")).toBe(false);
    expect(reachable.has("corridor-1491-803")).toBe(false);
    expect(reachable.has("corridor-1499-850")).toBe(false);
  });

  it("reaches the square before the west stairs in five steps, not the stairs", () => {
    const reachable = listSpacesAHeroCanMoveTo(
      dungeonBoard,
      "main-staircase",
      [],
    );

    expect(reachable.has("stairs-west")).toBe(false);
    expect(reachable.has("corridor-909-774")).toBe(true);
    expect(reachable.size).toBe(22);
  });

  it("does not land on another pawn in a corridor", () => {
    const reachable = listSpacesAHeroCanMoveTo(
      dungeonBoard,
      "main-staircase",
      [],
      ["corridor-1196-1020"],
    );

    expect(reachable.has("corridor-1196-1020")).toBe(false);
    expect(reachable.has("room-south")).toBe(false);
    expect(reachable.has("room-southeast")).toBe(false);
  });
});
