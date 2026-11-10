import type { SpacePlacement } from "./board/space-placement.ts";
import { SVG_NAMESPACE } from "./svg-namespace.ts";
import type { BoardBox } from "./board-grid.ts";

export const SPACE_INK = "#2b2118";

export function appendRect(
  group: SVGGElement,
  box: BoardBox,
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
  rect.setAttribute("stroke", SPACE_INK);
  group.append(rect);
}

export function appendCircle(
  group: SVGGElement,
  box: BoardBox,
  fill: string,
): void {
  const radius = Math.min(box.width, box.height) / 2 - 1;
  const circle = document.createElementNS(SVG_NAMESPACE, "circle");
  circle.setAttribute("cx", String(box.x + box.width / 2));
  circle.setAttribute("cy", String(box.y + box.height / 2));
  circle.setAttribute("r", String(radius));
  circle.setAttribute("fill", fill);
  circle.setAttribute("stroke", SPACE_INK);
  group.append(circle);
}

export function appendTriangle(
  group: SVGGElement,
  box: BoardBox,
  fill: string,
  tip: NonNullable<SpacePlacement["triangleTip"]>,
): void {
  const polygon = document.createElementNS(SVG_NAMESPACE, "polygon");
  polygon.setAttribute("points", trianglePoints(box, tip));
  polygon.setAttribute("fill", fill);
  polygon.setAttribute("stroke", SPACE_INK);
  group.append(polygon);
}

export function appendStairSteps(group: SVGGElement, box: BoardBox): void {
  for (const fraction of [0.35, 0.55, 0.75]) {
    const line = document.createElementNS(SVG_NAMESPACE, "line");
    line.setAttribute("x1", String(box.x + 4));
    line.setAttribute("y1", String(box.y + box.height * fraction));
    line.setAttribute("x2", String(box.x + box.width - 4));
    line.setAttribute("y2", String(box.y + box.height * fraction));
    line.setAttribute("stroke", SPACE_INK);
    group.append(line);
  }
}

function trianglePoints(
  box: BoardBox,
  tip: NonNullable<SpacePlacement["triangleTip"]>,
): string {
  const midX = box.x + box.width / 2;
  const midY = box.y + box.height / 2;
  const right = box.x + box.width;
  const bottom = box.y + box.height;

  if (tip === "east") {
    return `${right},${midY} ${box.x},${box.y} ${box.x},${bottom}`;
  }

  if (tip === "south") {
    return `${midX},${bottom} ${box.x},${box.y} ${right},${box.y}`;
  }

  if (tip === "west") {
    return `${box.x},${midY} ${right},${box.y} ${right},${bottom}`;
  }

  return `${midX},${box.y} ${box.x},${bottom} ${right},${bottom}`;
}
