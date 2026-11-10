import type { SpacePlacement } from "./space-placement.ts";
import type { BoardBox } from "../board-grid.ts";

export function boxFromPlacement(placement: SpacePlacement): BoardBox {
  return {
    x: placement.x,
    y: placement.y,
    width: placement.width,
    height: placement.height,
  };
}
