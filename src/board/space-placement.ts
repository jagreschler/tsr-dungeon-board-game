import type { PlacementShape, TriangleTip } from "./traced-space.ts";

export type SpacePlacement = {
  spaceIdentifier: string;
  x: number;
  y: number;
  width: number;
  height: number;
  shape: PlacementShape;
  triangleTip?: TriangleTip;
};

export type BoardLayout = {
  placements: SpacePlacement[];
};

export function createSpacePlacement(
  spaceIdentifier: string,
  x: number,
  y: number,
  width: number,
  height: number,
  shape: PlacementShape = "rect",
  triangleTip?: TriangleTip,
): SpacePlacement {
  return {
    spaceIdentifier,
    x,
    y,
    width,
    height,
    shape,
    triangleTip,
  };
}
