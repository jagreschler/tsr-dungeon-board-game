export const GRID_CELL_SIZE = 28;
export const BOARD_PADDING = 20;

export type GridBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export function boxFromGrid(
  column: number,
  row: number,
  columnSpan: number,
  rowSpan: number,
): GridBox {
  return {
    x: BOARD_PADDING + column * GRID_CELL_SIZE,
    y: BOARD_PADDING + row * GRID_CELL_SIZE,
    width: columnSpan * GRID_CELL_SIZE,
    height: rowSpan * GRID_CELL_SIZE,
  };
}

export function centerOfBox(box: GridBox): { x: number; y: number } {
  return {
    x: box.x + box.width / 2,
    y: box.y + box.height / 2,
  };
}
