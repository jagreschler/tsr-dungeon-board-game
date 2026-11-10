import { chamberOutlines } from "./chamber-outlines.ts";
import { roomOutlines } from "./room-outlines.ts";
import type { OutlinePoint, TracedSpace } from "../traced-space.ts";

export function applySpaceOutline(trace: TracedSpace): TracedSpace {
  const outline =
    chamberOutlines[trace.identifier] ?? roomOutlines[trace.identifier];

  if (outline === undefined) {
    return trace;
  }

  const box = boundsOf(outline);
  return {
    ...trace,
    ...box,
    outline,
    shape: "polygon",
  };
}

function boundsOf(outline: OutlinePoint[]): {
  x: number;
  y: number;
  width: number;
  height: number;
} {
  const xs = outline.map((point) => point.x);
  const ys = outline.map((point) => point.y);
  const x = Math.min(...xs);
  const y = Math.min(...ys);
  return {
    x,
    y,
    width: Math.max(...xs) - x,
    height: Math.max(...ys) - y,
  };
}
