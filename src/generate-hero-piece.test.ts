import { describe, expect, it } from "vitest";
import { dungeonLayout } from "./board/dungeon-layout.ts";
import { boxFromPlacement } from "./board/placement-box.ts";
import { findPlacement } from "./board/find-placement.ts";
import { centerOfBox } from "./board-grid.ts";
import { GenerateHeroPiece } from "./generate-hero-piece.ts";
import { heroPiece } from "./hero-piece.ts";

describe("GenerateHeroPiece", () => {
  it("draws the Hero token at the center of the space it sits on", () => {
    const token = new GenerateHeroPiece(heroPiece, dungeonLayout).element();
    const marker = token.querySelector("circle");

    expect(token.getAttribute("data-piece-kind")).toBe("hero");
    expect(token.getAttribute("data-space-identifier")).toBe("main-staircase");
    expect(marker instanceof SVGCircleElement).toBe(true);

    const placement = findPlacement(dungeonLayout, "main-staircase");
    expect(placement === undefined).toBe(false);
    if (placement === undefined || (marker instanceof SVGCircleElement) === false) {
      return;
    }

    const center = centerOfBox(boxFromPlacement(placement));
    expect(marker.cx.baseVal.value).toBe(center.x);
    expect(marker.cy.baseVal.value).toBe(center.y);
  });
});
