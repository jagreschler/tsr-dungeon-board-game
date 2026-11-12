import { afterEach, describe, expect, it } from "vitest";
import { dungeonBoard } from "../board/dungeon-board.ts";
import { dungeonLayout } from "../board/dungeon-layout.ts";
import { DungeonSession } from "../dungeon-session.ts";
import { heroPiece } from "../pieces/hero-piece.ts";
import { MonsterCardPreviewListener } from "./monster-card-preview-listener.ts";

afterEach(() => {
  document.body.replaceChildren();
});

describe("MonsterCardPreviewListener", () => {
  it("binds G when it hears OverlayDrawn", async () => {
    const session = new DungeonSession(dungeonBoard, dungeonLayout, heroPiece);
    new MonsterCardPreviewListener().listenForOverlayDrawn(session);
    const svg = session.element();
    document.body.append(svg);

    await import("./bind-monster-card-preview.ts");
    await Promise.resolve();
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "g" }));

    const overlay = document.querySelector("[data-monster-card-overlay]");
    expect(overlay === null).toBe(false);
    expect(overlay?.querySelector("video") === null).toBe(false);
  });
});
