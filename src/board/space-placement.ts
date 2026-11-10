export type SpacePlacement = {
  spaceIdentifier: string;
  column: number;
  row: number;
  columnSpan: number;
  rowSpan: number;
};

export type BoardLayout = {
  placements: SpacePlacement[];
};

export function createSpacePlacement(
  spaceIdentifier: string,
  column: number,
  row: number,
  columnSpan: number,
  rowSpan: number,
): SpacePlacement {
  return {
    spaceIdentifier,
    column,
    row,
    columnSpan,
    rowSpan,
  };
}
