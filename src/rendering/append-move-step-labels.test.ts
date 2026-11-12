import { describe, expect, it } from "vitest";
import { dungeonBoard } from "../board/dungeon-board.ts";
import { dungeonLayout } from "../board/dungeon-layout.ts";
import { appendMoveStepLabels } from "./append-move-step-labels.ts";
import { GenerateMoveHighlights } from "./generate-move-highlights.ts";
import { SVG_NAMESPACE } from "./svg-namespace.ts";

describe("appendMoveStepLabels", () => {
  it("writes the BFS step count on each highlighted space", () => {
    const reachable = new Set(["main-gallery", "corridor-1098-942"]);
    const stepCounts = new Map([
      ["main-gallery", 1],
      ["corridor-1098-942", 1],
    ]);
    const parent = document.createElementNS(SVG_NAMESPACE, "g");
    const highlights = new GenerateMoveHighlights(
      dungeonBoard,
      dungeonLayout,
      reachable,
    ).element();
    parent.append(highlights);

    const labels = appendMoveStepLabels(parent, dungeonLayout, stepCounts);
    const gallery = labels.querySelector(
      "[data-move-step-label='main-gallery']",
    );
    const hall = labels.querySelector(
      "[data-move-step-label='corridor-1098-942']",
    );

    expect(labels.getAttribute("data-move-step-labels")).toBe("true");
    expect(labels.getAttribute("pointer-events")).toBe("none");
    expect(gallery?.textContent).toBe("1");
    expect(hall?.textContent).toBe("1");
  });
});
