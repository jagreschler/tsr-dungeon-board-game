import type { Space } from "./board/space.ts";
import type { SpacePlacement } from "./board/space-placement.ts";
import { boxFromGrid } from "./board-grid.ts";
import { SVG_NAMESPACE } from "./svg-namespace.ts";

const ROOM_FILL = "#c9a227";
const CORRIDOR_FILL = "#7a7a7a";
const STAIRS_FILL = "#9a8b6a";
const STAIRCASE_FILL = "#f0e0b0";
const GALLERY_FILL = "#d7c58c";
const INK = "#2b2118";

export function appendSpaceShape(
  svg: SVGSVGElement,
  space: Space,
  placement: SpacePlacement,
): void {
  const box = boxFromGrid(
    placement.column,
    placement.row,
    placement.columnSpan,
    placement.rowSpan,
  );
  const group = document.createElementNS(SVG_NAMESPACE, "g");
  group.setAttribute("data-space-identifier", space.identifier);
  group.setAttribute("data-space-kind", space.kind);
  appendKindShape(group, space.kind, box);
  svg.append(group);
}

function appendKindShape(
  group: SVGGElement,
  kind: Space["kind"],
  box: { x: number; y: number; width: number; height: number },
): void {
  if (kind === "mainStaircase") {
    appendCircle(group, box, STAIRCASE_FILL);
    return;
  }

  if (kind === "mainGallery") {
    appendRect(group, box, GALLERY_FILL, 10);
    return;
  }

  if (kind === "room") {
    appendRect(group, box, ROOM_FILL, 2);
    return;
  }

  if (kind === "stairs") {
    appendRect(group, box, STAIRS_FILL, 2);
    appendStairSteps(group, box);
    return;
  }

  appendRect(group, box, CORRIDOR_FILL, 1);
}

function appendRect(
  group: SVGGElement,
  box: { x: number; y: number; width: number; height: number },
  fill: string,
  radius: number,
): void {
  const rect = document.createElementNS(SVG_NAMESPACE, "rect");
  rect.setAttribute("x", String(box.x));
  rect.setAttribute("y", String(box.y));
  rect.setAttribute("width", String(box.width));
  rect.setAttribute("height", String(box.height));
  rect.setAttribute("rx", String(radius));
  rect.setAttribute("fill", fill);
  rect.setAttribute("stroke", INK);
  group.append(rect);
}

function appendCircle(
  group: SVGGElement,
  box: { x: number; y: number; width: number; height: number },
  fill: string,
): void {
  const radius = Math.min(box.width, box.height) / 2 - 1;
  const circle = document.createElementNS(SVG_NAMESPACE, "circle");
  circle.setAttribute("cx", String(box.x + box.width / 2));
  circle.setAttribute("cy", String(box.y + box.height / 2));
  circle.setAttribute("r", String(radius));
  circle.setAttribute("fill", fill);
  circle.setAttribute("stroke", INK);
  group.append(circle);
}

function appendStairSteps(
  group: SVGGElement,
  box: { x: number; y: number; width: number; height: number },
): void {
  for (const fraction of [0.35, 0.55, 0.75]) {
    const line = document.createElementNS(SVG_NAMESPACE, "line");
    line.setAttribute("x1", String(box.x + 4));
    line.setAttribute("y1", String(box.y + box.height * fraction));
    line.setAttribute("x2", String(box.x + box.width - 4));
    line.setAttribute("y2", String(box.y + box.height * fraction));
    line.setAttribute("stroke", INK);
    group.append(line);
  }
}
