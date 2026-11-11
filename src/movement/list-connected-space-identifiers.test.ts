import { describe, expect, it } from "vitest";
import { listConnectedSpaceIdentifiers } from "./list-connected-space-identifiers.ts";

function neighborsFrom(
  edges: Record<string, readonly string[]>,
): (spaceIdentifier: string) => readonly string[] {
  return (spaceIdentifier) => edges[spaceIdentifier] ?? [];
}

describe("listConnectedSpaceIdentifiers", () => {
  it("includes the start space", () => {
    const connected = listConnectedSpaceIdentifiers(
      "start",
      neighborsFrom({
        start: ["hall"],
        hall: ["start"],
      }),
    );

    expect(connected.has("start")).toBe(true);
    expect(connected.has("hall")).toBe(true);
  });

  it("follows every neighbor edge, including past five steps", () => {
    const connected = listConnectedSpaceIdentifiers(
      "a",
      neighborsFrom({
        a: ["b"],
        b: ["a", "c"],
        c: ["b", "d"],
        d: ["c", "e"],
        e: ["d", "f"],
        f: ["e", "g"],
        g: ["f"],
      }),
    );

    expect(connected.has("g")).toBe(true);
  });

  it("omits a space with no path from the start", () => {
    const connected = listConnectedSpaceIdentifiers(
      "start",
      neighborsFrom({
        start: ["hall"],
        hall: ["start"],
        island: ["other"],
        other: ["island"],
      }),
    );

    expect(connected.has("island")).toBe(false);
    expect(connected.has("other")).toBe(false);
  });
});
