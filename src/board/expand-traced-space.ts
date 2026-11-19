import { boxOutline } from "./box-outline.ts";
import { createRoom, createSpace, type Space } from "./space.ts";
import {
  createSpacePlacement,
  type SpacePlacement,
} from "./space-placement.ts";
import type { TracedSpace } from "./traced-space.ts";

export function spaceFromTrace(trace: TracedSpace): Space {
  const extras = {
    isStart: trace.isStart,
    isSafe: trace.isSafe,
    printedName: trace.printedName,
  };

  if (trace.kind === "room") {
    return createRoom(trace.identifier, trace.level, extras);
  }

  return createSpace(trace.identifier, trace.kind, extras);
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
