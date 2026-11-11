import { paintMoveGlow } from "./paint-move-glow.ts";
import { SVG_NAMESPACE } from "./svg-namespace.ts";

export class GenerateOutlineMoveHighlight {
  constructor(private readonly outline: readonly { x: number; y: number }[]) {}

  element(): SVGPolygonElement {
    const polygon = document.createElementNS(SVG_NAMESPACE, "polygon");
    polygon.setAttribute(
      "points",
      this.outline.map((point) => `${point.x},${point.y}`).join(" "),
    );
    paintMoveGlow(polygon);
    return polygon;
  }
}
