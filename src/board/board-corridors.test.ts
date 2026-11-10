import { describe, expect, it } from "vitest";
import { dungeonTraces } from "./dungeon-traces.ts";

describe("board corridors", () => {
  it("has 353 corridor spaces", () => {
    const corridors = dungeonTraces.filter((trace) => {
      return trace.kind === "corridor";
    });

    expect(corridors.length).toBe(353);
  });
});
