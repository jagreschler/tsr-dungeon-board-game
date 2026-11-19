import { describe, expect, it } from "vitest";
import { dungeonTraces } from "../dungeon-traces.ts";
import { namedTraces } from "./named-traces.ts";

const namedChamberNames = [
  "Crypt",
  "Armory",
  "Council Room",
  "Kitchen",
  "Torture Chamber",
  "Storeroom",
  "Wizard's Treasure Room",
  "Wizard's Laboratory",
  "King's Treasure Room",
  "King's Library",
  "Queen's Treasure Room",
  "Queen's Treasure Room Annex",
] as const;

describe("named chambers and start", () => {
  it("lists the 12 named chambers", () => {
    const printedNames = namedTraces
      .map((trace) => trace.printedName)
      .filter((name): name is string => name !== undefined);

    for (const name of namedChamberNames) {
      expect(printedNames).toContain(name);
    }

    expect(namedChamberNames.length).toBe(12);
    expect(namedTraces.length).toBeGreaterThanOrEqual(12);
  });

  it("marks the Main Staircase as the start", () => {
    const start = dungeonTraces.find((trace) => trace.isStart === true);

    expect(start?.identifier).toBe("main-staircase");
    expect(start?.printedName).toBe("Main Staircase");
  });

  it("marks the Main Staircase as safe", () => {
    const start = dungeonTraces.find(
      (trace) => trace.identifier === "main-staircase",
    );

    expect(start?.isSafe).toBe(true);
    expect(start?.isStart).toBe(true);
  });
});
