import { centerOfBox } from "../board/board-grid.ts";
import { boxFromPlacement } from "../board/placement-box.ts";
import { findPlacement } from "../board/find-placement.ts";
import type { BoardLayout } from "../board/space-placement.ts";
import { SVG_NAMESPACE } from "./svg-namespace.ts";

export function appendMoveStepLabels(
  parent: SVGElement,
  layout: BoardLayout,
  stepCounts: ReadonlyMap<string, number>,
): SVGGElement {
  const group = document.createElementNS(SVG_NAMESPACE, "g");
  group.setAttribute("data-move-step-labels", "true");
  group.setAttribute("pointer-events", "none");

  for (const [spaceIdentifier, steps] of stepCounts) {
    const placement = findPlacement(layout, spaceIdentifier);
    if (placement === undefined) {
      continue;
    }

    const center = centerOfBox(boxFromPlacement(placement));
    const label = document.createElementNS(SVG_NAMESPACE, "text");
    label.setAttribute("data-move-step-label", spaceIdentifier);
    label.setAttribute("x", String(center.x));
    label.setAttribute("y", String(center.y));
    label.setAttribute("text-anchor", "middle");
    label.setAttribute("dominant-baseline", "central");
    label.textContent = String(steps);
    group.append(label);
  }

  parent.append(group);
  return group;
}
