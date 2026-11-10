export const BOARD_PADDING = 24;

export type BoardBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export function centerOfBox(box: BoardBox): { x: number; y: number } {
  return {
    x: box.x + box.width / 2,
    y: box.y + box.height / 2,
  };
}
