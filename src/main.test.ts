import { afterEach, describe, expect, it } from "vitest";

const TITLE = "#app .title";

afterEach(() => {
  document.body.replaceChildren();
});

describe("title page", () => {
  it("renders Dungeon!", async () => {
    document.body.append(page());
    await import("./main");

    const title = document.querySelector(TITLE);
    expect(title).toBeInstanceOf(HTMLElement);
    if (!(title instanceof HTMLElement)) {
      throw new Error("missing title");
    }
    expect(title.textContent).toBe("Dungeon!");

    const board = document.querySelector("#app .dungeon-board");
    expect(board).toBeInstanceOf(SVGSVGElement);
  });
});

function page(): HTMLElement {
  const main = document.createElement("main");
  main.id = "app";
  return main;
}
