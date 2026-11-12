import { afterEach, describe, expect, it } from "vitest";
import { bindStoredLinkMarks } from "./bind-stored-link-marks.ts";
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

function pressL(shiftKey = false): void {
  window.dispatchEvent(new KeyboardEvent("keydown", { key: "l", shiftKey }));
}

describe("bindStoredLinkMarks", () => {
  it("shows the stored-link marks on L and hides them on L again", () => {
    const svg = boardSvg();
    unbinders.push(bindStoredLinkMarks(svg, true));

    expect(svg.hasAttribute("data-stored-link-marks-visible")).toBe(false);

    pressL();

    expect(svg.getAttribute("data-stored-link-marks-visible")).toBe("true");

    pressL();

    expect(svg.hasAttribute("data-stored-link-marks-visible")).toBe(false);
  });

  it("does not listen for L when not in local development", () => {
    const svg = boardSvg();
    unbinders.push(bindStoredLinkMarks(svg, false));

    pressL();

    expect(svg.hasAttribute("data-stored-link-marks-visible")).toBe(false);
  });

  it("does not toggle on Shift+L", () => {
    const svg = boardSvg();
    unbinders.push(bindStoredLinkMarks(svg, true));

    pressL(true);

    expect(svg.hasAttribute("data-stored-link-marks-visible")).toBe(false);
  });
});
