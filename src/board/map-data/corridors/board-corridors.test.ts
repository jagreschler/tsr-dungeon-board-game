import { describe, expect, it } from "vitest";
import { dungeonTraces } from "../dungeon-traces.ts";

describe("board corridors", () => {
  it("has 345 corridor spaces", () => {
    const corridors = dungeonTraces.filter((trace) => {
      return trace.kind === "corridor";
    });

    expect(corridors.length).toBe(345);
  });

  it("does not give the southwest gold flagstone 1018-1011 a level", () => {
    const space = dungeonTraces.find((trace) => {
      return trace.identifier === "corridor-1018-1011";
    });

    expect(space === undefined).toBe(false);
    if (space !== undefined) {
      expect("level" in space).toBe(false);
    }
  });
});
