import type { BoardLayout, SpacePlacement } from "./space-placement.ts";

export function findPlacement(
  layout: BoardLayout,
  spaceIdentifier: string,
): SpacePlacement | undefined {
  return layout.placements.find((placement) => {
    return placement.spaceIdentifier === spaceIdentifier;
  });
}
