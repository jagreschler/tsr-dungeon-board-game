import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { bindReferenceOverlay } from "./bind-reference-overlay.ts";
import { paintMoveGlow } from "../rendering/paint-move-glow.ts";
import { SVG_NAMESPACE } from "../rendering/svg-namespace.ts";

const boardStyles = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "../style.css"),
  "utf8",
);

const unbinders: Array<() => void> = [];

beforeEach(() => {
  const style = document.createElement("style");
  style.setAttribute("data-board-styles", "true");
  style.textContent = boardStyles;
  document.head.append(style);
});

afterEach(() => {
  for (const unbind of unbinders) {
    unbind();
  }
  unbinders.length = 0;
  document.body.replaceChildren();
  document.querySelector("[data-board-styles]")?.remove();
});

function boardSvg(): SVGSVGElement {
  const svg = document.createElementNS(SVG_NAMESPACE, "svg");
  svg.setAttribute("class", "dungeon-board");
  const playOverlay = document.createElementNS(SVG_NAMESPACE, "g");
  playOverlay.setAttribute("data-play-overlay", "true");
  svg.append(playOverlay);
  return svg;
}

function paintedGlow(svg: SVGSVGElement): SVGRectElement {
  const highlight = document.createElementNS(SVG_NAMESPACE, "g");
  highlight.setAttribute("data-move-highlight", "room-3-14");
  const rect = document.createElementNS(SVG_NAMESPACE, "rect");
  paintMoveGlow(rect);
  highlight.append(rect);
  svg.querySelector("[data-play-overlay]")?.append(highlight);
  return rect;
}

function pressB(): void {
  window.dispatchEvent(new KeyboardEvent("keydown", { key: "b" }));
}

function glowBoard(): HTMLDivElement {
  const board = document.createElement("div");
  board.className = "dungeon-board";
  document.body.append(board);
  return board;
}

function glowFill(board: HTMLElement): string {
  return getComputedStyle(board).getPropertyValue("--move-glow-fill");
}

function glowStrokeWidth(board: HTMLElement): string {
  return getComputedStyle(board).getPropertyValue("--move-glow-stroke-width").trim();
}

describe("bindReferenceOverlay", () => {
  it("shows the overlay on B and hides it on B again", async () => {
    const svg = boardSvg();
    unbinders.push(
      bindReferenceOverlay(svg, true, async () => {
        return true;
      }),
    );

    expect(svg.querySelector("[data-reference-overlay]") === null).toBe(true);

    pressB();
    await Promise.resolve();

    const overlay = svg.querySelector("[data-reference-overlay]");
    expect(overlay === null).toBe(false);
    expect(overlay?.getAttribute("pointer-events")).toBe("none");
    expect(overlay?.getAttribute("display") === "none").toBe(false);
    expect(overlay?.nextElementSibling?.getAttribute("data-play-overlay")).toBe(
      "true",
    );

    const image = overlay?.querySelector("image");
    expect(image === null || image === undefined).toBe(false);
    expect(image?.getAttribute("opacity")).toBe("0.5");
    expect(image?.getAttribute("pointer-events")).toBe("none");
    expect(image?.getAttribute("x")).toBe("0");
    expect(image?.getAttribute("y")).toBe("0");
    expect(image?.getAttribute("width")).toBe("2200");
    expect(image?.getAttribute("height")).toBe("1702");
    expect(image?.getAttribute("href") ?? "").toContain(
      "reference-board-map.png",
    );

    pressB();
    await Promise.resolve();

    expect(overlay?.getAttribute("display")).toBe("none");
  });

  it("draws a gray backing under the overlay image and toggles it with B", async () => {
    const svg = boardSvg();
    unbinders.push(
      bindReferenceOverlay(svg, true, async () => {
        return true;
      }),
    );

    expect(svg.querySelector("[data-reference-overlay-backing]") === null).toBe(
      true,
    );

    pressB();
    await Promise.resolve();

    const overlay = svg.querySelector("[data-reference-overlay]");
    const backing = svg.querySelector("[data-reference-overlay-backing]");
    const image = overlay?.querySelector("image");
    expect(backing === null).toBe(false);
    expect(backing?.tagName.toLowerCase()).toBe("rect");
    expect(backing?.getAttribute("fill")).toBe("#808080");
    expect(backing?.getAttribute("x")).toBe("0");
    expect(backing?.getAttribute("y")).toBe("0");
    expect(backing?.getAttribute("width")).toBe("2200");
    expect(backing?.getAttribute("height")).toBe("1702");
    expect(backing?.getAttribute("pointer-events")).toBe("none");
    expect(backing?.nextElementSibling).toBe(image);
    expect(overlay?.nextElementSibling?.getAttribute("data-play-overlay")).toBe(
      "true",
    );
    expect(svg.getAttribute("data-reference-overlay-visible")).toBe("true");

    pressB();
    await Promise.resolve();

    expect(overlay?.getAttribute("display")).toBe("none");
    expect(svg.hasAttribute("data-reference-overlay-visible")).toBe(false);
  });

  it("softens the move glow while the overlay is on and restores it when off", async () => {
    const svg = boardSvg();
    document.body.append(svg);
    const glow = paintedGlow(svg);
    unbinders.push(
      bindReferenceOverlay(svg, true, async () => {
        return true;
      }),
    );

    expect(glow.getAttribute("fill") ?? "").toContain("0.42");
    expect(glow.getAttribute("stroke-width")).toBe("3");
    expect(glowFill(glowBoard())).toContain("0.42");
    expect(glowStrokeWidth(glowBoard())).toBe("3px");

    pressB();
    await Promise.resolve();

    expect(svg.getAttribute("data-reference-overlay-visible")).toBe("true");
    expect(glow.getAttribute("fill") ?? "").toContain("0.42");
    expect(glow.getAttribute("stroke-width")).toBe("3");
    const overlayOnBoard = glowBoard();
    overlayOnBoard.setAttribute(
      "data-reference-overlay-visible",
      svg.getAttribute("data-reference-overlay-visible") ?? "",
    );
    expect(glowFill(overlayOnBoard)).toContain("0.1");
    expect(glowStrokeWidth(overlayOnBoard)).toBe("1px");

    pressB();
    await Promise.resolve();

    expect(svg.hasAttribute("data-reference-overlay-visible")).toBe(false);
    expect(glowFill(glowBoard())).toContain("0.42");
    expect(glowStrokeWidth(glowBoard())).toBe("3px");
  });

  it("does nothing when the local image is missing", async () => {
    const svg = boardSvg();
    unbinders.push(
      bindReferenceOverlay(svg, true, async () => {
        return false;
      }),
    );

    pressB();
    await Promise.resolve();

    expect(svg.querySelector("[data-reference-overlay]") === null).toBe(true);
  });

  it("does not listen for B when not in local development", async () => {
    const svg = boardSvg();
    unbinders.push(
      bindReferenceOverlay(svg, false, async () => {
        return true;
      }),
    );

    pressB();
    await Promise.resolve();

    expect(svg.querySelector("[data-reference-overlay]") === null).toBe(true);
  });
});
