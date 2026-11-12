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

  it("hyphenates multi-word monster names in the file stem", () => {
    const assets = monsterCardHrefs(1, "Giant Lizard", true);

    expect(assets.imageHref ?? "").toContain("L1-giant-lizard.jpg");
    expect(assets.clipHref ?? "").toContain("L1-giant-lizard.mp4");
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
