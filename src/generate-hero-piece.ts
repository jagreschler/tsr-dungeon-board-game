import type { BoardLayout } from "./board/space-placement.ts";
import { boxFromPlacement } from "./board/placement-box.ts";
import { findPlacement } from "./board/find-placement.ts";
import { centerOfBox } from "./board-grid.ts";
import type { Piece } from "./piece.ts";
import { SVG_NAMESPACE } from "./svg-namespace.ts";

const TOKEN_FILL = "#1f4f8a";
const TOKEN_STROKE = "#f3e2c4";
const TOKEN_RADIUS = 18;
const MARK_FILL = "#f3e2c4";

export class GenerateHeroPiece {
  constructor(
    private readonly piece: Piece,
    private readonly layout: BoardLayout,
  ) {}

  element(): SVGGElement {
    const group = document.createElementNS(SVG_NAMESPACE, "g");
    group.setAttribute("data-piece-identifier", this.piece.identifier);
    group.setAttribute("data-piece-kind", this.piece.kind);
    group.setAttribute("data-space-identifier", this.piece.spaceIdentifier);
    group.setAttribute("role", "img");
    group.setAttribute("aria-label", "Hero");

    const placement = findPlacement(this.layout, this.piece.spaceIdentifier);
    if (placement === undefined) {
      return group;
    }

    const center = centerOfBox(boxFromPlacement(placement));
    const marker = document.createElementNS(SVG_NAMESPACE, "circle");
    marker.setAttribute("cx", String(center.x));
    marker.setAttribute("cy", String(center.y));
    marker.setAttribute("r", String(TOKEN_RADIUS));
    marker.setAttribute("fill", TOKEN_FILL);
    marker.setAttribute("stroke", TOKEN_STROKE);
    marker.setAttribute("stroke-width", "3");
    group.append(marker);

    const mark = document.createElementNS(SVG_NAMESPACE, "text");
    mark.setAttribute("x", String(center.x));
    mark.setAttribute("y", String(center.y));
    mark.setAttribute("text-anchor", "middle");
    mark.setAttribute("dominant-baseline", "central");
    mark.setAttribute("fill", MARK_FILL);
    mark.setAttribute("font-size", "16");
    mark.setAttribute("font-family", "Georgia, serif");
    mark.setAttribute("font-weight", "700");
    mark.textContent = "H";
    group.append(mark);

    return group;
  }
}
