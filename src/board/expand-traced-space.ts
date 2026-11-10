import { boxOutline } from "./box-outline.ts";
import { createSpace, type Space } from "./space.ts";
import {
  createSpacePlacement,
  type SpacePlacement,
} from "./space-placement.ts";
import type { TracedSpace } from "./traced-space.ts";

export function spaceFromTrace(trace: TracedSpace): Space {
  return createSpace(trace.identifier, trace.kind, trace.level, {
    isStart: trace.isStart,
    isSafe: trace.isSafe,
    printedName: trace.printedName,
    destinationLevel: trace.destinationLevel,
  });
}

export function placementFromTrace(trace: TracedSpace): SpacePlacement {
  const outline =
    trace.outline ?? boxOutline(trace.x, trace.y, trace.width, trace.height);

  return createSpacePlacement(
    trace.identifier,
    trace.x,
    trace.y,
    trace.width,
    trace.height,
    trace.shape ?? "rect",
    outline,
  );
}
