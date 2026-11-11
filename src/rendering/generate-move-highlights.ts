import type { Board } from "../board/board.ts";
import { describeSpace } from "../board/describe-space.ts";
import { findSpace } from "../board/find-space.ts";
import { findPlacement } from "../board/find-placement.ts";
import { boxFromPlacement } from "../board/placement-box.ts";
import type { Space } from "../board/space.ts";
import type { BoardLayout, SpacePlacement } from "../board/space-placement.ts";
import { GenerateBoxMoveHighlight } from "./generate-box-move-highlight.ts";
import { GenerateCircleMoveHighlight } from "./generate-circle-move-highlight.ts";
import { GenerateOutlineMoveHighlight } from "./generate-outline-move-highlight.ts";
import { SVG_NAMESPACE } from "./svg-namespace.ts";

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

      const space = findSpace(this.board, spaceIdentifier);
      const highlight = document.createElementNS(SVG_NAMESPACE, "g");
      highlight.setAttribute("data-move-highlight", spaceIdentifier);
      if (space !== undefined) {
        const title = document.createElementNS(SVG_NAMESPACE, "title");
        title.textContent = describeSpace(space);
        highlight.append(title);
      }
      highlight.append(shapeForPlacement(space, placement));
      group.append(highlight);
    }

    return group;
  }
}

function shapeForPlacement(
  space: Space | undefined,
  placement: SpacePlacement,
): SVGElement {
  const box = boxFromPlacement(placement);

  if (space !== undefined && space.kind === "mainStaircase") {
    return new GenerateCircleMoveHighlight(box).element();
  }

  if (placement.outline.length >= 4) {
    return new GenerateOutlineMoveHighlight(placement.outline).element();
  }

  return new GenerateBoxMoveHighlight(box).element();
}
