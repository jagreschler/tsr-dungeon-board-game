import type { Board } from "./board/board.ts";
import type { BoardLayout } from "./board/space-placement.ts";
import { findPlacement } from "./board/find-placement.ts";
import { boxFromGrid, centerOfBox } from "./board-grid.ts";
import { SVG_NAMESPACE } from "./svg-namespace.ts";

const DOOR_FILL = "#1a120c";
const DOOR_RADIUS = 4;

export function appendDoorMarkers(
  svg: SVGSVGElement,
  board: Board,
  layout: BoardLayout,
): void {
  const drawn = new Set<string>();

  for (const connection of board.connections) {
    if (connection.kind === "door") {
      const key = [
        connection.fromSpaceIdentifier,
        connection.toSpaceIdentifier,
      ]
        .sort()
        .join("|");

      if (drawn.has(key) === false) {
        drawn.add(key);
        appendDoorMarker(
          svg,
          layout,
          connection.fromSpaceIdentifier,
          connection.toSpaceIdentifier,
        );
      }
    }
  }
}

function appendDoorMarker(
  svg: SVGSVGElement,
  layout: BoardLayout,
  fromIdentifier: string,
  toIdentifier: string,
): void {
  const fromPlacement = findPlacement(layout, fromIdentifier);
  const toPlacement = findPlacement(layout, toIdentifier);

  if (fromPlacement === undefined || toPlacement === undefined) {
    return;
  }

  const fromCenter = centerOfBox(
    boxFromGrid(
      fromPlacement.column,
      fromPlacement.row,
      fromPlacement.columnSpan,
      fromPlacement.rowSpan,
    ),
  );
  const toCenter = centerOfBox(
    boxFromGrid(
      toPlacement.column,
      toPlacement.row,
      toPlacement.columnSpan,
      toPlacement.rowSpan,
    ),
  );
  const marker = document.createElementNS(SVG_NAMESPACE, "circle");
  marker.setAttribute("data-door-kind", "door");
  marker.setAttribute("cx", String((fromCenter.x + toCenter.x) / 2));
  marker.setAttribute("cy", String((fromCenter.y + toCenter.y) / 2));
  marker.setAttribute("r", String(DOOR_RADIUS));
  marker.setAttribute("fill", DOOR_FILL);
  svg.append(marker);
}
