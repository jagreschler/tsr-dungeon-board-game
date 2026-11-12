import { afterEach, describe, expect, it } from "vitest";
import { dungeonBoard } from "./board/dungeon-board.ts";
import { dungeonLayout } from "./board/dungeon-layout.ts";
import { MonsterDeck } from "./cards/monster-deck.ts";
import { heroPiece } from "./pieces/hero-piece.ts";
import { createPiece } from "./pieces/piece.ts";
import { DungeonSession } from "./dungeon-session.ts";

afterEach(() => {
  document.body.replaceChildren();
});

function clickHighlight(svg: SVGSVGElement, spaceIdentifier: string): void {
  svg.querySelector(`[data-move-highlight='${spaceIdentifier}']`)?.dispatchEvent(
    new MouseEvent("click", { bubbles: true }),
  );
}

describe("DungeonSession", () => {
  it("leaves the reference overlay off until B is pressed", () => {
    const play = new DungeonSession(dungeonBoard, dungeonLayout, heroPiece);
    const svg = play.element();

    expect(svg.querySelector("[data-reference-overlay]") === null).toBe(true);
  });

  it("draws no debug overlays on its own", () => {
    const play = new DungeonSession(dungeonBoard, dungeonLayout, heroPiece);
    const svg = play.element();

    expect(svg.querySelector("[data-stored-link-marks]") === null).toBe(true);
    expect(svg.querySelector("[data-move-step-labels]") === null).toBe(true);
    expect(svg.hasAttribute("data-stored-link-marks-visible")).toBe(false);
    expect(svg.hasAttribute("data-move-step-labels-visible")).toBe(false);
  });

  it("moves the Hero onto a highlighted space when that glow is clicked", () => {
    const play = new DungeonSession(dungeonBoard, dungeonLayout, heroPiece);
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

  it("shows a readable Goblins caption after a real gold-room draw", () => {
    const session = new DungeonSession(
      dungeonBoard,
      dungeonLayout,
      heroPiece,
      new MonsterDeck(["Goblins"]),
    );
    const svg = session.element();
    document.body.append(svg);
    clickHighlight(svg, "room-south");
    document.querySelector("[data-skip-clip]")?.dispatchEvent(
      new MouseEvent("click", { bubbles: true }),
    );

    const caption = document.querySelector("[data-monster-card-stats]");
    expect(caption?.textContent?.includes("Goblins")).toBe(true);
    expect(caption?.textContent?.includes("Lightning 6")).toBe(true);
    expect(caption?.classList.contains("monster-card-stats-parchment")).toBe(
      true,
    );
  });

  it("draws a Level 1 monster when the Hero enters a gold room", () => {
    const session = new DungeonSession(
      dungeonBoard,
      dungeonLayout,
      heroPiece,
      new MonsterDeck(["Skeleton"]),
    );
    const svg = session.element();
    document.body.append(svg);

    clickHighlight(svg, "room-south");

    const overlay = document.querySelector("[data-monster-card-overlay]");
    expect(overlay === null).toBe(false);
    expect(overlay?.textContent?.includes("Skeleton")).toBe(true);
    expect(svg.querySelector("[data-piece-kind='hero']")?.getAttribute(
      "data-space-identifier",
    )).toBe("room-south");
  });

  it("does not draw in the Main Gallery, a corridor, or a Level 2 room", () => {
    const session = new DungeonSession(
      dungeonBoard,
      dungeonLayout,
      heroPiece,
      new MonsterDeck(["Goblins"]),
    );
    const svg = session.element();
    document.body.append(svg);

    clickHighlight(svg, "main-gallery");
    expect(document.querySelector("[data-monster-card-overlay]") === null).toBe(
      true,
    );

    clickHighlight(svg, "corridor-1098-942");
    expect(document.querySelector("[data-monster-card-overlay]") === null).toBe(
      true,
    );

    const level2 = new DungeonSession(
      dungeonBoard,
      dungeonLayout,
      createPiece("hero", "hero", "corridor-638-260"),
      new MonsterDeck(["Goblins"]),
    );
    const level2Svg = level2.element();
    document.body.append(level2Svg);
    clickHighlight(level2Svg, "room-2-02");
    expect(document.querySelector("[data-monster-card-overlay]") === null).toBe(
      true,
    );
  });
});

