import { describe, expect, it } from "vitest";
import { dungeonTraces } from "../dungeon-traces.ts";

describe("board corridors", () => {
  it("has 354 corridor spaces", () => {
    const corridors = dungeonTraces.filter((trace) => {
      return trace.kind === "corridor";
    });

    expect(corridors.length).toBe(354);
  });

  it("treats the southwest gold flagstone 1018-1011 as level 1", () => {
    const space = dungeonTraces.find((trace) => {
      return trace.identifier === "corridor-1018-1011";
    });

    expect(space?.level).toBe(1);
  });
});
