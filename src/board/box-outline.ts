import type { OutlinePoint } from "./traced-space.ts";

export function boxOutline(
  x: number,
  y: number,
  width: number,
  height: number,
): OutlinePoint[] {
  return [
    { x, y },
    { x: x + width, y },
    { x: x + width, y: y + height },
    { x, y: y + height },
  ];
}
