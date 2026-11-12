import { afterEach, describe, expect, it } from "vitest";
import { dungeonBoard } from "../board/dungeon-board.ts";
import { dungeonLayout } from "../board/dungeon-layout.ts";
import {
  EVENT_OVERLAY_DRAWN,
  DungeonSession,
} from "../dungeon-session.ts";
import { heroPiece } from "../pieces/hero-piece.ts";
import { DebugMode } from "./debug-mode.ts";
import { DebugOverlayListener } from "./debug-overlay-listener.ts";

afterEach(() => {
  document.body.replaceChildren();
});

describe("EVENT_OVERLAY_DRAWN", () => {
  it("is published by the session after it draws the overlay", () => {
    const session = new DungeonSession(dungeonBoard, dungeonLayout, heroPiece);
    let overlayDrawnCount = 0;
    session.addEventListener(EVENT_OVERLAY_DRAWN, () => {
      overlayDrawnCount += 1;
    });

    const svg = session.element();

    expect(overlayDrawnCount).toBe(1);

    svg
      .querySelector("[data-move-highlight='main-gallery']")
      ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(overlayDrawnCount).toBe(2);
  });
});

describe("DebugOverlayListener", () => {
  it("adds L and D overlays when it hears OverlayDrawn", () => {
    const session = new DungeonSession(dungeonBoard, dungeonLayout, heroPiece);
    new DebugOverlayListener(new DebugMode("?debug")).listenForOverlayDrawn(
      session,
    );
    const svg = session.element();

    expect(svg.querySelector("[data-stored-link-marks]") === null).toBe(false);
    expect(svg.querySelector("[data-move-step-labels]") === null).toBe(false);
    expect(svg.hasAttribute("data-stored-link-marks-visible")).toBe(false);
    expect(svg.hasAttribute("data-move-step-labels-visible")).toBe(false);
  });

  it("shows the L overlay when debugOptions asks for links", () => {
    const session = new DungeonSession(dungeonBoard, dungeonLayout, heroPiece);
    new DebugOverlayListener(
      new DebugMode("?debug&debugOptions=links"),
    ).listenForOverlayDrawn(session);
    const svg = session.element();

    expect(svg.querySelector("[data-stored-link-marks]") === null).toBe(false);
    expect(svg.getAttribute("data-stored-link-marks-visible")).toBe("true");
    expect(svg.hasAttribute("data-move-step-labels-visible")).toBe(false);
  });

  it("shows the D overlay when debugOptions asks for steps", () => {
    const session = new DungeonSession(dungeonBoard, dungeonLayout, heroPiece);
    new DebugOverlayListener(
      new DebugMode("?debug&debugOptions=steps"),
    ).listenForOverlayDrawn(session);
    const svg = session.element();

    expect(svg.querySelector("[data-move-step-labels]") === null).toBe(false);
    expect(svg.getAttribute("data-move-step-labels-visible")).toBe("true");
    expect(svg.hasAttribute("data-stored-link-marks-visible")).toBe(false);
  });

  it("binds L when debug mode is on", async () => {
    const session = new DungeonSession(dungeonBoard, dungeonLayout, heroPiece);
    new DebugOverlayListener(new DebugMode("?debug")).listenForOverlayDrawn(
      session,
    );
    const svg = session.element();

    await import("./bind-stored-link-marks.ts");
    await Promise.resolve();
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "l" }));

    expect(svg.getAttribute("data-stored-link-marks-visible")).toBe("true");
  });

  it("leaves the L overlay hidden after a Hero move", () => {
    const session = new DungeonSession(dungeonBoard, dungeonLayout, heroPiece);
    new DebugOverlayListener(
      new DebugMode("?debug&debugOptions=links"),
    ).listenForOverlayDrawn(session);
    const svg = session.element();

    expect(svg.getAttribute("data-stored-link-marks-visible")).toBe("true");
    svg.removeAttribute("data-stored-link-marks-visible");

    svg
      .querySelector("[data-move-highlight='main-gallery']")
      ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(svg.hasAttribute("data-stored-link-marks-visible")).toBe(false);
    expect(svg.querySelector("[data-stored-link-marks]") === null).toBe(false);
  });

  it("leaves the D overlay hidden after a Hero move", () => {
    const session = new DungeonSession(dungeonBoard, dungeonLayout, heroPiece);
    new DebugOverlayListener(
      new DebugMode("?debug&debugOptions=steps"),
    ).listenForOverlayDrawn(session);
    const svg = session.element();

    expect(svg.getAttribute("data-move-step-labels-visible")).toBe("true");
    svg.removeAttribute("data-move-step-labels-visible");

    svg
      .querySelector("[data-move-highlight='main-gallery']")
      ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(svg.hasAttribute("data-move-step-labels-visible")).toBe(false);
    expect(svg.querySelector("[data-move-step-labels]") === null).toBe(false);
  });
});
