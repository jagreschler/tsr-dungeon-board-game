import { describe, expect, it } from "vitest";
import { boxOutline } from "./box-outline.ts";
import { dungeonTraces } from "./dungeon-traces.ts";
import { placementFromTrace, spaceFromTrace } from "./expand-traced-space.ts";
import type { TracedSpace } from "./traced-space.ts";

const sampleTrace: TracedSpace = {
  identifier: "main-staircase",
  kind: "mainStaircase",
  level: 1,
  x: 10,
  y: 20,
  width: 30,
  height: 40,
  printedName: "Main Staircase",
  isStart: true,
};

describe("traced space basics", () => {
  it("starts with an empty dungeon trace list", () => {
    expect(Array.isArray(dungeonTraces)).toBe(true);
    expect(dungeonTraces.length).toBe(0);
  });

  it("copies the printed name onto a space", () => {
    const space = spaceFromTrace(sampleTrace);

    expect(space.printedName).toBe("Main Staircase");
    expect(space.isStart).toBe(true);
    expect(space.identifier).toBe("main-staircase");
  });

  it("builds a four-point box outline for a placement", () => {
    const outline = boxOutline(10, 20, 30, 40);
    const placement = placementFromTrace(sampleTrace);

    expect(outline.length).toBe(4);
    expect(placement.outline.length).toBe(4);
    expect(placement.spaceIdentifier).toBe("main-staircase");
  });
});
