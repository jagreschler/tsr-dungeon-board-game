import type { BoardBox } from "../board/board-grid.ts";
import { paintMoveGlow } from "./paint-move-glow.ts";
import { SVG_NAMESPACE } from "./svg-namespace.ts";

export class GenerateBoxMoveHighlight {
  constructor(private readonly box: BoardBox) {}

  element(): SVGRectElement {
    const rect = document.createElementNS(SVG_NAMESPACE, "rect");
    rect.setAttribute("x", String(this.box.x));
    rect.setAttribute("y", String(this.box.y));
    rect.setAttribute("width", String(this.box.width));
    rect.setAttribute("height", String(this.box.height));
    rect.setAttribute("rx", "2");
    paintMoveGlow(rect);
    return rect;
  }
}
