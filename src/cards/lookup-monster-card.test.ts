import { describe, expect, it } from "vitest";
import {
  lookupMonsterCard,
  monsterCardHrefs,
} from "./lookup-monster-card.ts";

describe("lookupMonsterCard", () => {
  it("returns the goblins card image and clip from L1-goblins files", () => {
    const assets = lookupMonsterCard(1, "Goblins");

    expect(assets.imageHref ?? "").toContain("L1-goblins.jpg");
    expect(assets.clipHref ?? "").toContain("L1-goblins.mp4");
    expect(assets.imageHref ?? "").toContain("cards/");
  });

  it("slugs the monster name to lowercase", () => {
    const assets = lookupMonsterCard(1, "GOBLINS");

    expect(assets.imageHref ?? "").toContain("L1-goblins.jpg");
    expect(assets.clipHref ?? "").toContain("L1-goblins.mp4");
  });

  it("returns the hobgoblins card image and clip from L1-hobgoblins files", () => {
    const assets = lookupMonsterCard(1, "Hobgoblins");

    expect(assets.imageHref ?? "").toContain("L1-hobgoblins.jpg");
    expect(assets.clipHref ?? "").toContain("L1-hobgoblins.mp4");
  });

  it("returns the giant lizard card image and clip from L1-giant-lizard files", () => {
    const assets = lookupMonsterCard(1, "Giant Lizard");

    expect(assets.imageHref ?? "").toContain("L1-giant-lizard.jpg");
    expect(assets.clipHref ?? "").toContain("L1-giant-lizard.mp4");
  });

  it("uses parchment caption ink on the Goblins dark-red stats box", () => {
    expect(lookupMonsterCard(1, "Goblins").statsBox).toEqual({
      topPercent: 74.8,
      heightPercent: 16,
      ink: "parchment",
    });
  });

  it("uses the default dark ink on parchment stats-boxes", () => {
    expect(lookupMonsterCard(1, "Hobgoblins").statsBox).toEqual({
      topPercent: 74.8,
      heightPercent: 16,
      ink: "dark",
    });
    expect(lookupMonsterCard(1, "Giant Lizard").statsBox.ink).toBe("dark");
    expect(lookupMonsterCard(1, "Skeleton").statsBox.ink).toBe("dark");
  });

  it("uses a taller, higher stats-box for giant lizard", () => {
    expect(lookupMonsterCard(1, "Giant Lizard").statsBox).toEqual({
      topPercent: 67,
      heightPercent: 19,
      ink: "dark",
    });
  });

  it("hyphenates multi-word monster names in the file stem", () => {
    const assets = monsterCardHrefs(1, "Giant Lizard", true);

    expect(assets.imageHref ?? "").toContain("L1-giant-lizard.jpg");
    expect(assets.clipHref ?? "").toContain("L1-giant-lizard.mp4");
  });

  it("omits art and clip for skeleton and giant rats", () => {
    const skeleton = lookupMonsterCard(1, "Skeleton");
    const rats = lookupMonsterCard(1, "Giant Rats");

    expect(skeleton.imageHref).toBe(undefined);
    expect(skeleton.clipHref).toBe(undefined);
    expect(rats.imageHref).toBe(undefined);
    expect(rats.clipHref).toBe(undefined);
  });

  it("omits the clip when the monster is unknown", () => {
    const assets = lookupMonsterCard(1, "Owlbear");

    expect(assets.imageHref).toBe(undefined);
    expect(assets.clipHref).toBe(undefined);
  });

  it("omits the clip when the monster has card art but no clip file", () => {
    const assets = monsterCardHrefs(1, "Goblins", false);

    expect(assets.imageHref ?? "").toContain("L1-goblins.jpg");
    expect(assets.clipHref).toBe(undefined);
  });
});
