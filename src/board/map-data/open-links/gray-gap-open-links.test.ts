import { describe, expect, it } from "vitest";
import { dungeonLinkTuples } from "../board-links.ts";
import { grayGapOpenLinks } from "./gray-gap-open-links.ts";

function pairKey(left: string, right: string): string {
  return [left, right].sort().join(" ");
}

describe("gray-gap open links", () => {
  it("lists 34 printed gray-floor skips, each at least 3px", () => {
    const keys = grayGapOpenLinks.map((link) => {
      return pairKey(link.fromSpaceIdentifier, link.toSpaceIdentifier);
    });

    expect(grayGapOpenLinks).toHaveLength(34);
    expect(new Set(keys).size).toBe(34);
    for (const link of grayGapOpenLinks) {
      expect(link.grayPx >= 3).toBe(true);
    }
  });

  it("does not keep an open hall across gray floor", () => {
    const banned = new Set(
      grayGapOpenLinks.map((link) => {
        return pairKey(link.fromSpaceIdentifier, link.toSpaceIdentifier);
      }),
    );
    const stillOpen = dungeonLinkTuples
      .filter((tuple) => tuple[2] === "open")
      .map((tuple) => pairKey(tuple[0], tuple[1]))
      .filter((key) => banned.has(key))
      .sort();

    expect(stillOpen).toEqual([]);
  });
});
