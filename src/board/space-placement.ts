import type { OutlinePoint, PlacementShape } from "./traced-space.ts";

export type SpacePlacement = {
  spaceIdentifier: string;
  x: number;
  y: number;
  width: number;
  height: number;
  shape: PlacementShape;
  outline: OutlinePoint[];
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
  outline: OutlinePoint[] = [],
): SpacePlacement {
  return {
    spaceIdentifier,
    x,
    y,
    width,
    height,
    shape,
    outline,
  };
}
