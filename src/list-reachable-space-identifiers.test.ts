import { describe, expect, it } from "vitest";
import { listReachableSpaceIdentifiers } from "./list-reachable-space-identifiers.ts";

function neighborsFrom(
  edges: Record<string, readonly string[]>,
): (spaceIdentifier: string) => readonly string[] {
  return (spaceIdentifier) => edges[spaceIdentifier] ?? [];
}

describe("listReachableSpaceIdentifiers", () => {
  it("counts each space as one step and does not charge extra for a door-like edge", () => {
    const reachable = listReachableSpaceIdentifiers("hall", 1, {
      neighborsOf: neighborsFrom({
        hall: ["room"],
        room: ["hall"],
      }),
    });

    expect(reachable.has("room")).toBe(true);
  });

  it("does not include a space six steps away when the limit is five", () => {
    const reachable = listReachableSpaceIdentifiers("a", 5, {
      neighborsOf: neighborsFrom({
        a: ["b"],
        b: ["a", "c"],
        c: ["b", "d"],
        d: ["c", "e"],
        e: ["d", "f"],
        f: ["e", "g"],
        g: ["f"],
      }),
    });

    expect(reachable.has("b")).toBe(true);
    expect(reachable.has("f")).toBe(true);
    expect(reachable.has("g")).toBe(false);
  });

  it("omits a neighbor the rules mark as blocked", () => {
    const reachable = listReachableSpaceIdentifiers("a", 5, {
      neighborsOf: neighborsFrom({
        a: ["secret-room"],
        "secret-room": ["a"],
      }),
      isBlocked: (spaceIdentifier) => spaceIdentifier === "secret-room",
    });

    expect(reachable.has("secret-room")).toBe(false);
  });

  it("can stop in a room without continuing past it", () => {
    const reachable = listReachableSpaceIdentifiers("hall", 5, {
      neighborsOf: neighborsFrom({
        hall: ["room"],
        room: ["hall", "beyond"],
        beyond: ["room"],
      }),
      isStoppingSpace: (spaceIdentifier) => spaceIdentifier === "room",
    });

    expect(reachable.has("room")).toBe(true);
    expect(reachable.has("beyond")).toBe(false);
  });

  it("can leave a stopping space the piece already sits in", () => {
    const reachable = listReachableSpaceIdentifiers("room", 5, {
      neighborsOf: neighborsFrom({
        room: ["hall"],
        hall: ["room", "beyond"],
        beyond: ["hall"],
      }),
      isStoppingSpace: (spaceIdentifier) => spaceIdentifier === "room",
    });

    expect(reachable.has("hall")).toBe(true);
    expect(reachable.has("beyond")).toBe(true);
  });

  it("can pass through Start and the Main Gallery", () => {
    const reachable = listReachableSpaceIdentifiers("west-stub", 5, {
      neighborsOf: neighborsFrom({
        "west-stub": ["start"],
        start: ["west-stub", "gallery"],
        gallery: ["start", "east-stub"],
        "east-stub": ["gallery"],
      }),
      isStoppingSpace: (spaceIdentifier) => spaceIdentifier === "chamber",
    });

    expect(reachable.has("start")).toBe(true);
    expect(reachable.has("gallery")).toBe(true);
    expect(reachable.has("east-stub")).toBe(true);
  });

  it("does not include the space the piece already sits on", () => {
    const reachable = listReachableSpaceIdentifiers("start", 5, {
      neighborsOf: neighborsFrom({
        start: ["hall"],
        hall: ["start"],
      }),
    });

    expect(reachable.has("start")).toBe(false);
    expect(reachable.has("hall")).toBe(true);
  });
});
