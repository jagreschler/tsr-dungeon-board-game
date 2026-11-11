import { describe, expect, it } from "vitest";
import { GenerateBoxMoveHighlight } from "./generate-box-move-highlight.ts";

describe("GenerateBoxMoveHighlight", () => {
  it("draws a glowing rounded rectangle from the box", () => {
    const rect = new GenerateBoxMoveHighlight({
      x: 10,
      y: 20,
      width: 100,
      height: 80,
    }).element();

    expect(rect.tagName.toLowerCase()).toBe("rect");
    expect(rect.getAttribute("x")).toBe("10");
    expect(rect.getAttribute("y")).toBe("20");
    expect(rect.getAttribute("width")).toBe("100");
    expect(rect.getAttribute("height")).toBe("80");
    expect(rect.getAttribute("rx")).toBe("2");
    expect(rect.getAttribute("fill") ?? "").toContain("80, 220, 120");
  });
});
