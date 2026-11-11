import { afterEach, describe, expect, it } from "vitest";
import { bindJasperOverlay } from "./bind-jasper-overlay.ts";
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
  const playOverlay = document.createElementNS(SVG_NAMESPACE, "g");
  playOverlay.setAttribute("data-play-overlay", "true");
  svg.append(playOverlay);
  return svg;
}

function pressB(): void {
  window.dispatchEvent(new KeyboardEvent("keydown", { key: "b" }));
}

describe("bindJasperOverlay", () => {
  it("shows the overlay on B and hides it on B again", async () => {
    const svg = boardSvg();
    unbinders.push(
      bindJasperOverlay(svg, true, async () => {
        return true;
      }),
    );

    expect(svg.querySelector("[data-jasper-overlay]") === null).toBe(true);

    pressB();
    await Promise.resolve();

    const overlay = svg.querySelector("[data-jasper-overlay]");
    expect(overlay === null).toBe(false);
    expect(overlay?.tagName.toLowerCase()).toBe("image");
    expect(overlay?.getAttribute("opacity")).toBe("0.5");
    expect(overlay?.getAttribute("pointer-events")).toBe("none");
    expect(overlay?.getAttribute("x")).toBe("0");
    expect(overlay?.getAttribute("y")).toBe("0");
    expect(overlay?.getAttribute("width")).toBe("2200");
    expect(overlay?.getAttribute("height")).toBe("1702");
    expect(overlay?.getAttribute("href") ?? "").toContain(
      "jasper-dungeon-map-standard-orientation.png",
    );
    expect(overlay?.getAttribute("display") === "none").toBe(false);
    expect(overlay?.nextElementSibling?.getAttribute("data-play-overlay")).toBe(
      "true",
    );

    pressB();
    await Promise.resolve();

    expect(overlay?.getAttribute("display")).toBe("none");
  });

  it("does nothing when the local image is missing", async () => {
    const svg = boardSvg();
    unbinders.push(
      bindJasperOverlay(svg, true, async () => {
        return false;
      }),
    );

    pressB();
    await Promise.resolve();

    expect(svg.querySelector("[data-jasper-overlay]") === null).toBe(true);
  });

  it("does not listen for B when not in local development", async () => {
    const svg = boardSvg();
    unbinders.push(
      bindJasperOverlay(svg, false, async () => {
        return true;
      }),
    );

    pressB();
    await Promise.resolve();

    expect(svg.querySelector("[data-jasper-overlay]") === null).toBe(true);
  });
});
