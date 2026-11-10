import { describe, expect, it } from "vitest";
import { dungeonBoard } from "./board/dungeon-board.ts";
import { dungeonLayout } from "./board/dungeon-layout.ts";
import { GenerateMoveHighlights } from "./generate-move-highlights.ts";

describe("GenerateMoveHighlights", () => {
  it("draws a green glow on each reachable space", () => {
    const reachable = new Set(["main-gallery", "corridor-1098-942"]);
    const group = new GenerateMoveHighlights(
      dungeonBoard,
      dungeonLayout,
      reachable,
    ).element();
    const highlights = group.querySelectorAll("[data-move-highlight]");

    expect(highlights.length).toBe(2);
    expect(
      group.querySelector("[data-move-highlight='main-gallery']") === null,
    ).toBe(false);
    expect(
      group.querySelector("[data-move-highlight='corridor-1098-942']") ===
        null,
    ).toBe(false);

    for (const highlight of highlights) {
      const painted = highlight.querySelector("[fill]");
      expect(painted === null).toBe(false);
      expect(painted?.getAttribute("fill") ?? "").toContain("80, 220, 120");
    }
  });
});
