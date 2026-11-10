import type { Space } from "./board/space.ts";
import type { SpacePlacement } from "./board/space-placement.ts";
import type { Level } from "./board/level.ts";
import { boxFromPlacement } from "./board/placement-box.ts";
import { appendChamberLabel } from "./append-chamber-label.ts";
import {
  appendCircle,
  appendPolygon,
  appendRect,
  appendStairSteps,
} from "./append-space-geometry.ts";
import { SVG_NAMESPACE } from "./svg-namespace.ts";
import type { BoardBox } from "./board-grid.ts";

const ROOM_FILL: Record<Level, string> = {
  1: "#e3b23c",
  2: "#3f8f4a",
  3: "#e07020",
  4: "#c4458a",
  5: "#d23a32",
  6: "#2f7cc0",
};

const CORRIDOR_FILL = "#d4b44a";
const STAIRS_FILL = "#c4a060";
const STAIRCASE_FILL = "#f0e0b0";
const GALLERY_FILL = "#e8d9a0";
const CHAMBER_FILL = "#efe0a8";

export function appendSpaceShape(
  svg: SVGSVGElement,
  space: Space,
  placement: SpacePlacement,
): void {
  const box = boxFromPlacement(placement);
  const group = document.createElementNS(SVG_NAMESPACE, "g");
  group.setAttribute("data-space-identifier", space.identifier);
  group.setAttribute("data-space-kind", space.kind);
  group.setAttribute("data-space-level", String(space.level));
  appendKindShape(group, space, placement, box);

  if (space.printedName !== undefined) {
    appendChamberLabel(group, space.printedName, box);
  }

  svg.append(group);
}

function appendKindShape(
  group: SVGGElement,
  space: Space,
  placement: SpacePlacement,
  box: BoardBox,
): void {
  if (space.kind === "mainStaircase") {
    appendCircle(group, box, STAIRCASE_FILL);
    return;
  }

  if (usesTracedOutline(space, placement)) {
    appendPolygon(group, placement.outline, fillForEnclosedSpace(space));
    return;
  }

  if (space.kind === "stairs") {
    appendRect(group, box, STAIRS_FILL, 8);
    appendStairSteps(group, box);
    return;
  }

  appendRect(group, box, CORRIDOR_FILL, 1);
}

function usesTracedOutline(space: Space, placement: SpacePlacement): boolean {
  if (placement.outline.length < 4) {
    return false;
  }

  return (
    space.kind === "room" ||
    space.kind === "chamber" ||
    space.kind === "mainGallery"
  );
}

function fillForEnclosedSpace(space: Space): string {
  if (space.kind === "mainGallery") {
    return GALLERY_FILL;
  }

  if (space.kind === "chamber") {
    return CHAMBER_FILL;
  }

  return ROOM_FILL[space.level];
}
