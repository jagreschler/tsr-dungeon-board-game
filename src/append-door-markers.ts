import type { Board } from "./board/board.ts";
import { findSpace } from "./board/find-space.ts";
import type { BoardLayout, SpacePlacement } from "./board/space-placement.ts";
import { findPlacement } from "./board/find-placement.ts";
import { boxFromPlacement } from "./board/placement-box.ts";
import { centerOfBox } from "./board-grid.ts";
import { pointOnSharedWall } from "./shared-wall-point.ts";
import { SVG_NAMESPACE } from "./svg-namespace.ts";

const DOOR_FILL = "#1a120c";
const DOOR_RADIUS = 5;

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
          board,
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
  board: Board,
  layout: BoardLayout,
  fromIdentifier: string,
  toIdentifier: string,
): void {
  const fromPlacement = findPlacement(layout, fromIdentifier);
  const toPlacement = findPlacement(layout, toIdentifier);

  if (fromPlacement === undefined || toPlacement === undefined) {
    return;
  }

  const point = pointForDoor(
    board,
    fromIdentifier,
    toIdentifier,
    fromPlacement,
    toPlacement,
  );

  const marker = document.createElementNS(SVG_NAMESPACE, "circle");
  marker.setAttribute("data-door-kind", "door");
  marker.setAttribute("data-from-space-identifier", fromIdentifier);
  marker.setAttribute("data-to-space-identifier", toIdentifier);
  marker.setAttribute("cx", String(point.x));
  marker.setAttribute("cy", String(point.y));
  marker.setAttribute("r", String(DOOR_RADIUS));
  marker.setAttribute("fill", DOOR_FILL);
  svg.append(marker);
}

function pointForDoor(
  board: Board,
  fromIdentifier: string,
  toIdentifier: string,
  fromPlacement: SpacePlacement,
  toPlacement: SpacePlacement,
): { x: number; y: number } {
  const fromHasWall = spaceHasDoorWall(board, fromIdentifier);
  const toHasWall = spaceHasDoorWall(board, toIdentifier);

  if (
    fromHasWall &&
    fromPlacement.outline.length >= 2 &&
    toPlacement.outline.length >= 2
  ) {
    return pointOnSharedWall(fromPlacement.outline, toPlacement.outline);
  }

  if (
    toHasWall &&
    toPlacement.outline.length >= 2 &&
    fromPlacement.outline.length >= 2
  ) {
    return pointOnSharedWall(toPlacement.outline, fromPlacement.outline);
  }

  const fromCenter = centerOfBox(boxFromPlacement(fromPlacement));
  const toCenter = centerOfBox(boxFromPlacement(toPlacement));
  return {
    x: (fromCenter.x + toCenter.x) / 2,
    y: (fromCenter.y + toCenter.y) / 2,
  };
}

function spaceHasDoorWall(board: Board, identifier: string): boolean {
  const space = findSpace(board, identifier);

  if (space === undefined) {
    return false;
  }

  return (
    space.kind === "room" ||
    space.kind === "chamber" ||
    space.kind === "mainGallery"
  );
}
