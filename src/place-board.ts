import {
  EVENT_BOARD_BEFORE_DRAW,
  EVENT_BOARD_DRAWN,
  type BoardDrawnDetail,
} from "./board-events.ts";
import type { DungeonSession } from "./dungeon-session.ts";

export function placeBoard(
  host: HTMLElement,
  session: DungeonSession,
): SVGSVGElement {
  session.dispatchEvent(new CustomEvent(EVENT_BOARD_BEFORE_DRAW));
  const board = session.element();
  host.append(board);
  session.dispatchEvent(
    new CustomEvent<BoardDrawnDetail>(EVENT_BOARD_DRAWN, {
      detail: { svg: board },
    }),
  );
  return board;
}
