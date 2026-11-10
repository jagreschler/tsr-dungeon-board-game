import type { Board } from "./board/board.ts";
import { findSpace } from "./board/find-space.ts";
import { findPlacement } from "./board/find-placement.ts";
import { boxFromPlacement } from "./board/placement-box.ts";
import type { BoardLayout, SpacePlacement } from "./board/space-placement.ts";
import { SVG_NAMESPACE } from "./svg-namespace.ts";

const GLOW_FILL = "rgba(80, 220, 120, 0.42)";
const GLOW_STROKE = "rgba(120, 255, 170, 0.95)";

export class GenerateMoveHighlights {
  constructor(
    private readonly board: Board,
    private readonly layout: BoardLayout,
    private readonly reachableSpaceIdentifiers: ReadonlySet<string>,
  ) {}

  element(): SVGGElement {
    const group = document.createElementNS(SVG_NAMESPACE, "g");
    group.setAttribute("data-move-highlights", "true");

    for (const spaceIdentifier of this.reachableSpaceIdentifiers) {
      const placement = findPlacement(this.layout, spaceIdentifier);
      if (placement === undefined) {
        continue;
      }

      const highlight = document.createElementNS(SVG_NAMESPACE, "g");
      highlight.setAttribute("data-move-highlight", spaceIdentifier);
      appendGlowShape(highlight, this.board, spaceIdentifier, placement);
      group.append(highlight);
    }

    return group;
  }
}

function appendGlowShape(
  group: SVGGElement,
  board: Board,
  spaceIdentifier: string,
  placement: SpacePlacement,
): void {
  const space = findSpace(board, spaceIdentifier);
  const box = boxFromPlacement(placement);

  if (space !== undefined && space.kind === "mainStaircase") {
    const circle = document.createElementNS(SVG_NAMESPACE, "circle");
    circle.setAttribute("cx", String(box.x + box.width / 2));
    circle.setAttribute("cy", String(box.y + box.height / 2));
    circle.setAttribute("r", String(Math.min(box.width, box.height) / 2));
    paintGlow(circle);
    group.append(circle);
    return;
  }

  if (placement.outline.length >= 4) {
    const polygon = document.createElementNS(SVG_NAMESPACE, "polygon");
    polygon.setAttribute(
      "points",
      placement.outline.map((point) => `${point.x},${point.y}`).join(" "),
    );
    paintGlow(polygon);
    group.append(polygon);
    return;
  }

  const rect = document.createElementNS(SVG_NAMESPACE, "rect");
  rect.setAttribute("x", String(box.x));
  rect.setAttribute("y", String(box.y));
  rect.setAttribute("width", String(box.width));
  rect.setAttribute("height", String(box.height));
  rect.setAttribute("rx", "2");
  paintGlow(rect);
  group.append(rect);
}

function paintGlow(shape: SVGElement): void {
  shape.setAttribute("fill", GLOW_FILL);
  shape.setAttribute("stroke", GLOW_STROKE);
  shape.setAttribute("stroke-width", "3");
}
