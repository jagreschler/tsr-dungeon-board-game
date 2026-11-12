import { afterEach, describe, expect, it } from "vitest";
import { dungeonBoard } from "../board/dungeon-board.ts";
import { dungeonLayout } from "../board/dungeon-layout.ts";
import {
  EVENT_BOARD_DRAWING,
  EVENT_BOARD_DRAWN,
  type BoardDrawnDetail,
} from "./board-events.ts";
import { DungeonSession } from "../dungeon-session.ts";
import { heroPiece } from "../pieces/hero-piece.ts";
import { placeBoard } from "./place-board.ts";

afterEach(() => {
  document.body.replaceChildren();
});

describe("placeBoard", () => {
  it("dispatches BoardDrawing, then BoardDrawn once the board is on the page", () => {
    const host = document.createElement("main");
    document.body.append(host);
    const session = new DungeonSession(dungeonBoard, dungeonLayout, heroPiece);
    const names: string[] = [];
    let parentAtDrawn: ParentNode | null = null;
    let boardMissingAtDrawing = false;

    session.addEventListener(EVENT_BOARD_DRAWING, () => {
      names.push(EVENT_BOARD_DRAWING);
      boardMissingAtDrawing = host.querySelector(".dungeon-board") === null;
    });
    session.addEventListener(EVENT_BOARD_DRAWN, (event) => {
      names.push(EVENT_BOARD_DRAWN);
      if ((event instanceof CustomEvent) === false) {
        return;
      }
      const detail = event.detail as BoardDrawnDetail;
      parentAtDrawn = detail.svg.parentElement;
    });

    placeBoard(host, session);

    expect(EVENT_BOARD_DRAWING).toBe("BoardDrawing");
    expect(EVENT_BOARD_DRAWN).toBe("BoardDrawn");
    expect(names).toEqual([EVENT_BOARD_DRAWING, EVENT_BOARD_DRAWN]);
    expect(boardMissingAtDrawing).toBe(true);
    expect(parentAtDrawn).toBe(host);
  });
});
