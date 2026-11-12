import { afterEach, describe, expect, it } from "vitest";
import { bindMonsterCardPreview } from "./bind-monster-card-preview.ts";
import { SVG_NAMESPACE } from "../rendering/svg-namespace.ts";

const unbinders: Array<() => void> = [];

afterEach(() => {
  for (const unbind of unbinders) {
    unbind();
  }
  unbinders.length = 0;
  document.body.replaceChildren();
});

function boardSvg(): SVGSVGElement {
  const svg = document.createElementNS(SVG_NAMESPACE, "svg");
  svg.setAttribute("class", "dungeon-board");
  document.body.append(svg);
  return svg;
}

function pressKey(key: string, shiftKey = false): void {
  window.dispatchEvent(new KeyboardEvent("keydown", { key, shiftKey }));
}

describe("bindMonsterCardPreview", () => {
  it("shows the goblins clip on G during local development", () => {
    unbinders.push(bindMonsterCardPreview(boardSvg(), true));

    pressKey("g");

    const overlay = document.querySelector("[data-monster-card-overlay]");
    expect(overlay === null).toBe(false);
    expect(overlay?.querySelector("video") === null).toBe(false);
    expect(overlay?.querySelector("[data-skip-clip]")?.textContent).toBe("Skip");
  });

  it("shows the goblins card with no clip on Shift+G", () => {
    unbinders.push(bindMonsterCardPreview(boardSvg(), true));

    pressKey("g", true);

    const overlay = document.querySelector("[data-monster-card-overlay]");
    expect(overlay?.querySelector("video") === null).toBe(true);
    expect(overlay?.textContent?.includes("Goblins")).toBe(true);
    expect(overlay?.textContent?.includes("Lightning 6")).toBe(true);
  });

  it("shows the hobgoblins clip on H during local development", () => {
    unbinders.push(bindMonsterCardPreview(boardSvg(), true));

    pressKey("h");

    const overlay = document.querySelector("[data-monster-card-overlay]");
    expect(overlay === null).toBe(false);
    expect(overlay?.querySelector("video") === null).toBe(false);
    expect(
      overlay?.querySelector("video")?.getAttribute("src") ?? "",
    ).toContain("L1-hobgoblins.mp4");
  });

  it("shows the hobgoblins card with no clip on Shift+H", () => {
    unbinders.push(bindMonsterCardPreview(boardSvg(), true));

    pressKey("h", true);

    const overlay = document.querySelector("[data-monster-card-overlay]");
    expect(overlay?.querySelector("video") === null).toBe(true);
    expect(overlay?.textContent?.includes("Hobgoblins")).toBe(true);
    expect(overlay?.textContent?.includes("Lightning 3")).toBe(true);
  });

  it("does not show the giant lizard clip on L", () => {
    unbinders.push(bindMonsterCardPreview(boardSvg(), true));

    pressKey("l");

    expect(document.querySelector("[data-monster-card-overlay]") === null).toBe(
      true,
    );
  });

  it("shows the giant lizard card with no clip on Shift+L", () => {
    unbinders.push(bindMonsterCardPreview(boardSvg(), true));

    pressKey("l", true);

    const overlay = document.querySelector("[data-monster-card-overlay]");
    expect(overlay?.querySelector("video") === null).toBe(true);
    expect(overlay?.textContent?.includes("Giant Lizard")).toBe(true);
    expect(overlay?.textContent?.includes("Lightning 2")).toBe(true);
  });

  it("shows the giant rats clip on R during local development", () => {
    unbinders.push(bindMonsterCardPreview(boardSvg(), true));

    pressKey("r");

    const overlay = document.querySelector("[data-monster-card-overlay]");
    expect(overlay === null).toBe(false);
    expect(overlay?.querySelector("video") === null).toBe(false);
    expect(
      overlay?.querySelector("video")?.getAttribute("src") ?? "",
    ).toContain("L1-giant-rats.mp4");
  });

  it("shows the giant rats card with no clip on Shift+R", () => {
    unbinders.push(bindMonsterCardPreview(boardSvg(), true));

    pressKey("r", true);

    const overlay = document.querySelector("[data-monster-card-overlay]");
    expect(overlay?.querySelector("video") === null).toBe(true);
    expect(overlay?.textContent?.includes("Giant Rats")).toBe(true);
    expect(overlay?.textContent?.includes("Lightning 7")).toBe(true);
  });

  it("does not listen for G when not in local development", () => {
    unbinders.push(bindMonsterCardPreview(boardSvg(), false));

    pressKey("g");

    expect(document.querySelector("[data-monster-card-overlay]") === null).toBe(
      true,
    );
  });
});
