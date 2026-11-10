import { describe, expect, it } from "vitest";
import { GenerateCircleMoveHighlight } from "./generate-circle-move-highlight.ts";

describe("GenerateCircleMoveHighlight", () => {
  it("draws a glowing circle at the box center", () => {
    const circle = new GenerateCircleMoveHighlight({
      x: 10,
      y: 20,
      width: 100,
      height: 80,
    }).element();

    expect(circle.tagName.toLowerCase()).toBe("circle");
    expect(circle.getAttribute("cx")).toBe("60");
    expect(circle.getAttribute("cy")).toBe("60");
    expect(circle.getAttribute("r")).toBe("40");
    expect(circle.getAttribute("fill") ?? "").toContain("80, 220, 120");
  });
});
