import type { Board } from "../board/board.ts";
import { centerOfBox } from "../board/board-grid.ts";
import { boxFromPlacement } from "../board/placement-box.ts";
import { findPlacement } from "../board/find-placement.ts";
import type { BoardLayout } from "../board/space-placement.ts";
import { storedDoorMarkEnds } from "./stored-door-mark-ends.ts";
import { SVG_NAMESPACE } from "../rendering/svg-namespace.ts";

export function appendStoredLinkMarks(
  parent: SVGElement,
  board: Board,
  layout: BoardLayout,
): SVGGElement {
  const group = document.createElementNS(SVG_NAMESPACE, "g");
  group.setAttribute("data-stored-link-marks", "true");
  group.setAttribute("pointer-events", "none");
  const seen = new Set<string>();

  for (const connection of board.connections) {
    const pair = [
      connection.fromSpaceIdentifier,
      connection.toSpaceIdentifier,
    ].sort();
    const key = `${pair[0]} ${pair[1]} ${connection.kind}`;
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);

    const fromPlacement = findPlacement(
      layout,
      connection.fromSpaceIdentifier,
    );
    const toPlacement = findPlacement(layout, connection.toSpaceIdentifier);
    if (fromPlacement === undefined || toPlacement === undefined) {
      continue;
    }

    const centers = {
      start: centerOfBox(boxFromPlacement(fromPlacement)),
      end: centerOfBox(boxFromPlacement(toPlacement)),
    };
    const doorEnds =
      connection.kind === "door" || connection.kind === "secretDoor"
        ? storedDoorMarkEnds(
            board,
            layout,
            connection.fromSpaceIdentifier,
            connection.toSpaceIdentifier,
          )
        : undefined;
    const from = doorEnds?.start ?? centers.start;
    const to = doorEnds?.end ?? centers.end;
    const line = document.createElementNS(SVG_NAMESPACE, "line");
    line.setAttribute("data-stored-link-mark", "true");
    line.setAttribute("data-link-kind", connection.kind);
    line.setAttribute(
      "data-from-space-identifier",
      connection.fromSpaceIdentifier,
    );
    line.setAttribute(
      "data-to-space-identifier",
      connection.toSpaceIdentifier,
    );
    line.setAttribute("x1", String(from.x));
    line.setAttribute("y1", String(from.y));
    line.setAttribute("x2", String(to.x));
    line.setAttribute("y2", String(to.y));
    group.append(line);
  }

  parent.append(group);
  return group;
}
