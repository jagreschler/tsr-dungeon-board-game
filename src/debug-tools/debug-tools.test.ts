import { afterEach, describe, expect, it } from "vitest";
import { dungeonBoard } from "../board/dungeon-board.ts";
import { dungeonLayout } from "../board/dungeon-layout.ts";
import { DungeonSession } from "../dungeon-session.ts";
import { heroPiece } from "../pieces/hero-piece.ts";
import { EVENT_BOARD_DRAWING } from "../board-events.ts";
import { placeBoard } from "../place-board.ts";
import { DebugMode } from "./debug-mode.ts";
import { DebugTools } from "./debug-tools.ts";

afterEach(() => {
  document.body.replaceChildren();
});

describe("DebugTools", () => {
  it("adds L and D overlays and places the picker after the board", () => {
    const { host, svg } = placedBoardWithDebug(new DebugMode("?debug"));

    expect(svg.querySelector("[data-stored-link-marks]") === null).toBe(false);
    expect(svg.querySelector("[data-move-step-labels]") === null).toBe(false);
    expect(
      svg.nextElementSibling?.getAttribute("data-reference-image-picker"),
    ).toBe("true");
    expect(host.contains(svg)).toBe(true);
  });

  it("shows the L overlay when debugOptions asks for links", () => {
    const { svg } = placedBoardWithDebug(
      new DebugMode("?debug&debugOptions=links"),
    );

    expect(svg.getAttribute("data-stored-link-marks-visible")).toBe("true");
    expect(svg.hasAttribute("data-move-step-labels-visible")).toBe(false);
  });

  it("binds G when debug mode is on via ?debug with isDev false", async () => {
    const debugMode = new DebugMode("?debug", false);
    expect(debugMode.isOn()).toBe(true);
    placedBoardWithDebug(debugMode);

    await import("../cards/bind-monster-card-preview.ts");
    await Promise.resolve();
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "g" }));

    const overlay = document.querySelector("[data-monster-card-overlay]");
    expect(overlay === null).toBe(false);
    expect(overlay?.querySelector("video") === null).toBe(false);
  });

  it("hooks overlay listeners only once if BoardDrawing fires twice", async () => {
    const host = document.createElement("main");
    document.body.append(host);
    const session = new DungeonSession(dungeonBoard, dungeonLayout, heroPiece);
    new DebugTools(new DebugMode("?debug")).listen(session);

    session.dispatchEvent(new CustomEvent(EVENT_BOARD_DRAWING));
    session.dispatchEvent(new CustomEvent(EVENT_BOARD_DRAWING));
    const svg = placeBoard(host, session);

    expect(svg.querySelectorAll("[data-stored-link-marks]").length).toBe(1);
    expect(svg.querySelectorAll("[data-move-step-labels]").length).toBe(1);

    await import("./bind-stored-link-marks.ts");
    await Promise.resolve();
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "l" }));

    expect(svg.getAttribute("data-stored-link-marks-visible")).toBe("true");
  });

  it("does not wire debug tools when they are not listening", () => {
    const host = document.createElement("main");
    document.body.append(host);
    const session = new DungeonSession(dungeonBoard, dungeonLayout, heroPiece);
    const svg = placeBoard(host, session);

    expect(svg.querySelector("[data-stored-link-marks]") === null).toBe(true);
    expect(svg.querySelector("[data-move-step-labels]") === null).toBe(true);
    expect(svg.nextElementSibling === null).toBe(true);
  });
});

function placedBoardWithDebug(debugMode: DebugMode): {
  host: HTMLElement;
  svg: SVGSVGElement;
} {
  const host = document.createElement("main");
  document.body.append(host);
  const session = new DungeonSession(dungeonBoard, dungeonLayout, heroPiece);
  new DebugTools(debugMode).listen(session);
  const svg = placeBoard(host, session);
  return { host, svg };
}
