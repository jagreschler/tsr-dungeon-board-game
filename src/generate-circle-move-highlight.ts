import type { BoardBox } from "./board-grid.ts";
import { paintMoveGlow } from "./paint-move-glow.ts";
import { SVG_NAMESPACE } from "./svg-namespace.ts";

export class GenerateCircleMoveHighlight {
  constructor(private readonly box: BoardBox) {}

  element(): SVGCircleElement {
    const circle = document.createElementNS(SVG_NAMESPACE, "circle");
    circle.setAttribute("cx", String(this.box.x + this.box.width / 2));
    circle.setAttribute("cy", String(this.box.y + this.box.height / 2));
    circle.setAttribute(
      "r",
      String(Math.min(this.box.width, this.box.height) / 2),
    );
    paintMoveGlow(circle);
    return circle;
  }
}
