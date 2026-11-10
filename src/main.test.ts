import { afterEach, describe, expect, it } from "vitest";

const TITLE = "#app .title";

afterEach(() => {
  document.body.replaceChildren();
});

describe("title page", () => {
  it("renders Dungeon! with one board SVG", async () => {
    document.body.append(page());
    await import("./main");

    const title = document.querySelector(TITLE);
    expect(title).toBeInstanceOf(HTMLElement);
    if (!(title instanceof HTMLElement)) {
      throw new Error("missing title");
    }
    expect(title.textContent).toBe("Dungeon!");

    const boards = document.querySelectorAll("#app .dungeon-board");
    expect(boards.length).toBe(1);
    expect(boards[0]).toBeInstanceOf(SVGSVGElement);

    const heroToken = document.querySelector(
      "#app .dungeon-board [data-piece-kind='hero']",
    );
    expect(heroToken === null).toBe(false);
    expect(heroToken?.getAttribute("data-space-identifier")).toBe(
      "main-staircase",
    );

    expect(document.body.textContent?.includes("Level 1")).toBe(false);
    expect(document.body.textContent?.includes("Great Hall")).toBe(false);
  });
});

function page(): HTMLElement {
  const main = document.createElement("main");
  main.id = "app";
  return main;
}
