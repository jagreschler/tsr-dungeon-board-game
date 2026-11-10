import { describe, expect, it } from "vitest";
import { dungeonBoard } from "./board/dungeon-board.ts";
import { dungeonLayout } from "./board/dungeon-layout.ts";
import { heroPiece } from "./hero-piece.ts";
import { PlayDungeon } from "./play-dungeon.ts";

describe("PlayDungeon", () => {
  it("moves the Hero onto a highlighted space when that glow is clicked", () => {
    const play = new PlayDungeon(dungeonBoard, dungeonLayout, heroPiece);
    const svg = play.element();
    const galleryGlow = svg.querySelector(
      "[data-move-highlight='main-gallery']",
    );

    expect(galleryGlow === null).toBe(false);
    galleryGlow?.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    const token = svg.querySelector("[data-piece-kind='hero']");
    expect(token?.getAttribute("data-space-identifier")).toBe("main-gallery");
    expect(
      svg.querySelector("[data-move-highlight='main-gallery']") === null,
    ).toBe(true);
    expect(
      svg.querySelector("[data-move-highlight='main-staircase']") === null,
    ).toBe(false);
  });
});
