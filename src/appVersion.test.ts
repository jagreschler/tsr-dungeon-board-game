import { afterEach, describe, expect, it } from "vitest";

const VERSION = ".app-version";
const LABEL = "v0.2.0";

afterEach(() => {
  document.body.replaceChildren();
});

describe("app version", () => {
  it("shows the version on the page", async () => {
    document.body.append(page());
    await import("./main");

    const version = document.querySelector(VERSION);
    expect(version).toBeInstanceOf(HTMLElement);
    if (!(version instanceof HTMLElement)) {
      throw new Error("missing app version");
    }
    expect(version.textContent).toBe(LABEL);
    expect(version.textContent?.includes(".")).toBe(true);
  });
});

function page(): HTMLElement {
  const main = document.createElement("main");
  main.id = "app";
  return main;
}
