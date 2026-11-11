import { SVG_NAMESPACE } from "./svg-namespace.ts";
import type { BoardBox } from "../board/board-grid.ts";

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

export function appendPolygon(
  group: SVGGElement,
  outline: readonly { x: number; y: number }[],
  fill: string,
): void {
  const polygon = document.createElementNS(SVG_NAMESPACE, "polygon");
  const points = outline
    .map((point) => `${point.x},${point.y}`)
    .join(" ");
  polygon.setAttribute("points", points);
  polygon.setAttribute("fill", fill);
  polygon.setAttribute("stroke", SPACE_INK);
  polygon.setAttribute("stroke-linejoin", "round");
  group.append(polygon);
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
