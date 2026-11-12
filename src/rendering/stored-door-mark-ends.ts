import type { Board } from "../board/board.ts";
import { boxOutline } from "../board/box-outline.ts";
import { centerOfBox } from "../board/board-grid.ts";
import { findPlacement } from "../board/find-placement.ts";
import { findSpace } from "../board/find-space.ts";
import { boxFromPlacement } from "../board/placement-box.ts";
import type { BoardLayout, SpacePlacement } from "../board/space-placement.ts";
import type { Space } from "../board/space.ts";
import type { BoardPoint } from "./shared-wall-point.ts";
import { pointOnSharedWall } from "./shared-wall-point.ts";

export function storedDoorMarkEnds(
  board: Board,
  layout: BoardLayout,
  fromIdentifier: string,
  toIdentifier: string,
): { start: BoardPoint; end: BoardPoint } | undefined {
  const fromSpace = findSpace(board, fromIdentifier);
  const toSpace = findSpace(board, toIdentifier);
  const fromPlacement = findPlacement(layout, fromIdentifier);
  const toPlacement = findPlacement(layout, toIdentifier);
  if (
    fromSpace === undefined ||
    toSpace === undefined ||
    fromPlacement === undefined ||
    toPlacement === undefined
  ) {
    return undefined;
  }

  const fromCenter = centerOfBox(boxFromPlacement(fromPlacement));
  const toCenter = centerOfBox(boxFromPlacement(toPlacement));
  const fromIsHall = isHallKind(fromSpace);
  const toIsHall = isHallKind(toSpace);
  const fromHasWall = spaceHasDoorWall(fromSpace);
  const toHasWall = spaceHasDoorWall(toSpace);
  const fromOutline = outlineOf(fromPlacement);
  const toOutline = outlineOf(toPlacement);

  if (toIsHall && fromHasWall && fromIsHall === false) {
    return {
      start: toCenter,
      end: pointOnSharedWall(fromOutline, toOutline),
    };
  }

  if (fromIsHall && toHasWall) {
    return {
      start: fromCenter,
      end: pointOnSharedWall(toOutline, fromOutline),
    };
  }

  return {
    start: fromCenter,
    end: pointOnSharedWall(fromOutline, toOutline),
  };
}

function isHallKind(space: Space): boolean {
  return (
    space.kind === "corridor" ||
    space.kind === "stairs" ||
    space.kind === "mainStaircase"
  );
}

function spaceHasDoorWall(space: Space): boolean {
  return (
    space.kind === "room" ||
    space.kind === "chamber" ||
    space.kind === "mainGallery"
  );
}

function outlineOf(placement: SpacePlacement): BoardPoint[] {
  if (placement.outline.length >= 2) {
    return placement.outline;
  }

  return boxOutline(
    placement.x,
    placement.y,
    placement.width,
    placement.height,
  );
}
