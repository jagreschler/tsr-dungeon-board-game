import { describe, expect, it } from "vitest";
import { GenerateOutlineMoveHighlight } from "./generate-outline-move-highlight.ts";

describe("GenerateOutlineMoveHighlight", () => {
  it("draws a glowing polygon from the outline points", () => {
    const polygon = new GenerateOutlineMoveHighlight([
      { x: 1, y: 2 },
      { x: 5, y: 2 },
      { x: 5, y: 8 },
      { x: 1, y: 8 },
    ]).element();

    expect(polygon.tagName.toLowerCase()).toBe("polygon");
    expect(polygon.getAttribute("points")).toBe("1,2 5,2 5,8 1,8");
    expect(polygon.getAttribute("fill") ?? "").toContain("80, 220, 120");
  });
});
