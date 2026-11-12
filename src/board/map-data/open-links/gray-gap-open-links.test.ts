import { describe, expect, it } from "vitest";
import { dungeonLinkTuples } from "../board-links.ts";
import { grayGapOpenLinks } from "./gray-gap-open-links.ts";

function pairKey(left: string, right: string): string {
  return [left, right].sort().join(" ");
}

describe("gray-gap open links", () => {
  it("lists 34 printed gray-floor skips and one corner-only skip", () => {
    const keys = grayGapOpenLinks.map((link) => {
      return pairKey(link.fromSpaceIdentifier, link.toSpaceIdentifier);
    });
    const graySkips = grayGapOpenLinks.filter((link) => link.grayPx > 0);
    const cornerSkips = grayGapOpenLinks.filter((link) => link.grayPx === 0);

    expect(grayGapOpenLinks).toHaveLength(35);
    expect(new Set(keys).size).toBe(35);
    expect(graySkips).toHaveLength(34);
    expect(cornerSkips).toHaveLength(1);
    const cornerSkip = cornerSkips[0];
    if (cornerSkip === undefined) {
      throw new Error("expected the 1358-918 / 1385-982 corner skip");
    }
    expect(
      pairKey(cornerSkip.fromSpaceIdentifier, cornerSkip.toSpaceIdentifier),
    ).toBe("corridor-1358-918 corridor-1385-982");
    for (const link of graySkips) {
      expect(link.grayPx >= 3).toBe(true);
    }
  });

  it("does not keep an open hall across gray floor or a corner-only touch", () => {
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
