import type { Board } from "../board/board.ts";
import { findPlacement } from "../board/find-placement.ts";
import type { BoardLayout } from "../board/space-placement.ts";
import { appendDoorMarkers } from "./append-door-markers.ts";
import { appendSpaceShape } from "./append-space-shape.ts";
import { BOARD_PADDING } from "../board/board-grid.ts";
import { boxFromPlacement } from "../board/placement-box.ts";
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
    svg.setAttribute("aria-label", "The 1981 Dungeon! board");
    svg.setAttribute("viewBox", this.viewBox());
    this.appendStoneFloor(svg);

    for (const space of this.board.spaces) {
      const placement = findPlacement(this.layout, space.identifier);

      if (placement !== undefined) {
        appendSpaceShape(svg, space, placement);
      }
    }

    appendDoorMarkers(svg, this.board, this.layout);
    return svg;
  }

  private appendStoneFloor(svg: SVGSVGElement): void {
    const parts = this.viewBox().split(" ").map(Number);
    const floor = document.createElementNS(SVG_NAMESPACE, "rect");
    floor.setAttribute("x", String(parts[0] ?? 0));
    floor.setAttribute("y", String(parts[1] ?? 0));
    floor.setAttribute("width", String(parts[2] ?? 0));
    floor.setAttribute("height", String(parts[3] ?? 0));
    floor.setAttribute("fill", "#1a1410");
    svg.append(floor);
  }

  private viewBox(): string {
    let minX = Number.POSITIVE_INFINITY;
    let minY = Number.POSITIVE_INFINITY;
    let maxX = 0;
    let maxY = 0;

    for (const placement of this.layout.placements) {
      const box = boxFromPlacement(placement);
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
