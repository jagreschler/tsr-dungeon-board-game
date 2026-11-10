import { describe, expect, it } from "vitest";
import { dungeonBoard } from "../board/dungeon-board.ts";
import { listSpacesAHeroCanMoveTo } from "./list-spaces-a-hero-can-move-to.ts";

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
    expect(fromTreasure.has("corridor-1828-214")).toBe(false);
    expect(fromTreasure.has("corridor-1764-226")).toBe(false);
    expect(fromTreasure.has("corridor-1709-223")).toBe(false);
    expect(fromRoomEast.has("corridor-1319-730")).toBe(true);
  });

  it("stops in a room or chamber and does not continue past it", () => {
    const reachable = listSpacesAHeroCanMoveTo(
      dungeonBoard,
      "main-staircase",
      [],
    );

    expect(reachable.has("room-east-northeast")).toBe(true);
    expect(reachable.has("room-northwest")).toBe(false);
  });

  it("can pass through the Main Staircase and the Main Gallery", () => {
    const reachable = listSpacesAHeroCanMoveTo(
      dungeonBoard,
      "corridor-1098-942",
      [],
    );

    expect(reachable.has("main-staircase")).toBe(true);
    expect(reachable.has("main-gallery")).toBe(true);
    expect(reachable.has("corridor-1252-704")).toBe(true);
  });

  it("does not land on another pawn in a corridor", () => {
    const reachable = listSpacesAHeroCanMoveTo(
      dungeonBoard,
      "main-staircase",
      [],
      ["corridor-1098-942"],
    );

    expect(reachable.has("corridor-1098-942")).toBe(false);
    expect(reachable.has("room-south")).toBe(false);
  });
});
