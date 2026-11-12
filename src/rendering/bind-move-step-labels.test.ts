import { afterEach, describe, expect, it } from "vitest";
import { bindMoveStepLabels } from "./bind-move-step-labels.ts";
import { SVG_NAMESPACE } from "./svg-namespace.ts";

const unbinders: Array<() => void> = [];

afterEach(() => {
  for (const unbind of unbinders) {
    unbind();
  }
  unbinders.length = 0;
});

function boardSvg(): SVGSVGElement {
  const svg = document.createElementNS(SVG_NAMESPACE, "svg");
  svg.setAttribute("class", "dungeon-board");
  return svg;
}

function pressD(): void {
  window.dispatchEvent(new KeyboardEvent("keydown", { key: "d" }));
}

describe("bindMoveStepLabels", () => {
  it("shows the step numbers on D and hides them on D again", () => {
    const svg = boardSvg();
    unbinders.push(bindMoveStepLabels(svg, true));

    expect(svg.hasAttribute("data-move-step-labels-visible")).toBe(false);

    pressD();

    expect(svg.getAttribute("data-move-step-labels-visible")).toBe("true");

    pressD();

    expect(svg.hasAttribute("data-move-step-labels-visible")).toBe(false);
  });

  it("does not listen for D when not in local development", () => {
    const svg = boardSvg();
    unbinders.push(bindMoveStepLabels(svg, false));

    pressD();

    expect(svg.hasAttribute("data-move-step-labels-visible")).toBe(false);
  });
});
