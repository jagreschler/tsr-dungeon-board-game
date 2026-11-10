import type { Board } from "./board/board.ts";
import { findPlacement } from "./board/find-placement.ts";
import type { BoardLayout } from "./board/space-placement.ts";
import { appendDoorMarkers } from "./append-door-markers.ts";
import { appendSpaceShape } from "./append-space-shape.ts";
import { BOARD_PADDING, boxFromGrid } from "./board-grid.ts";
import { SVG_NAMESPACE } from "./svg-namespace.ts";

export class GenerateBoard {
  constructor(
    private readonly board: Board,
    private readonly layout: BoardLayout,
  ) {}

  svg(): SVGSVGElement {
    const svg = document.createElementNS(SVG_NAMESPACE, "svg");
    svg.setAttribute("class", "dungeon-board");
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", "Level 1 of the dungeon board");
    svg.setAttribute("viewBox", this.viewBox());

    for (const space of this.board.spaces) {
      const placement = findPlacement(this.layout, space.identifier);

      if (placement !== undefined) {
        appendSpaceShape(svg, space, placement);
      }
    }

    appendDoorMarkers(svg, this.board, this.layout);
    return svg;
  }

  private viewBox(): string {
    let minX = Number.POSITIVE_INFINITY;
    let minY = Number.POSITIVE_INFINITY;
    let maxX = 0;
    let maxY = 0;

    for (const placement of this.layout.placements) {
      const box = boxFromGrid(
        placement.column,
        placement.row,
        placement.columnSpan,
        placement.rowSpan,
      );
      minX = Math.min(minX, box.x);
      minY = Math.min(minY, box.y);
      maxX = Math.max(maxX, box.x + box.width);
      maxY = Math.max(maxY, box.y + box.height);
    }

    const x = minX - BOARD_PADDING;
    const y = minY - BOARD_PADDING;
    const width = maxX - minX + BOARD_PADDING * 2;
    const height = maxY - minY + BOARD_PADDING * 2;
    return `${x} ${y} ${width} ${height}`;
  }
}
