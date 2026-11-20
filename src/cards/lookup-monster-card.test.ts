import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { LEVEL_1_MONSTER_NAMES } from "./monster-deck.ts";
import { lookupMonsterCard, monsterSlug } from "./lookup-monster-card.ts";

describe("lookupMonsterCard", () => {
  it("gives the same monster the same art on any level", () => {
    const goblins = lookupMonsterCard("Goblins");

    expect(goblins.imageHref ?? "").toContain("cards/goblins.jpg");
    expect(goblins.clipHref ?? "").toContain("cards/goblins.mp4");
    expect((goblins.imageHref ?? "").includes("L1-")).toBe(false);
    expect((goblins.imageHref ?? "").includes("L6-")).toBe(false);
  });

  it("gives every Level 1 monster a card image in public/cards", () => {
    for (const name of new Set(LEVEL_1_MONSTER_NAMES)) {
      const href = lookupMonsterCard(name).imageHref ?? "";
      const fileName = `${monsterSlug(name)}.jpg`;

      expect(href.endsWith(`cards/${fileName}`)).toBe(true);
      expect(existsSync(resolve("public/cards", fileName))).toBe(true);
    }
  });

  it("slugs a shouted or spaced name onto that same picture", () => {
    const goblins = lookupMonsterCard("GOBLINS");
    const lizard = lookupMonsterCard("Giant Lizard");

    expect(goblins.imageHref ?? "").toContain("cards/goblins.jpg");
    expect(goblins.clipHref ?? "").toContain("cards/goblins.mp4");
    expect(lizard.imageHref ?? "").toContain("cards/giant-lizard.jpg");
    expect(lizard.clipHref ?? "").toContain("cards/giant-lizard.mp4");
  });

  it("plays a clip only for the monsters that have one", () => {
    expect(lookupMonsterCard("Hobgoblins").clipHref ?? "").toContain(
      "cards/hobgoblins.mp4",
    );
    expect(lookupMonsterCard("Giant Rats").clipHref ?? "").toContain(
      "cards/giant-rats.mp4",
    );
    expect(lookupMonsterCard("Skeleton").imageHref ?? "").toContain(
      "cards/skeleton.jpg",
    );
    expect(lookupMonsterCard("Skeleton").clipHref).toBe(undefined);
  });

  it("uses parchment caption ink on the Goblins dark-red stats box", () => {
    expect(lookupMonsterCard("Goblins").statsBox).toEqual({
      topPercent: 76,
      heightPercent: 20,
      ink: "parchment",
    });
  });

  it("uses the default dark ink on parchment stats-boxes", () => {
    expect(lookupMonsterCard("Hobgoblins").statsBox).toEqual({
      topPercent: 74.8,
      heightPercent: 16,
      ink: "dark",
    });
    expect(lookupMonsterCard("Giant Lizard").statsBox.ink).toBe("dark");
  });

  it("uses a taller, higher stats-box for giant lizard", () => {
    expect(lookupMonsterCard("Giant Lizard").statsBox).toEqual({
      topPercent: 67,
      heightPercent: 19,
      ink: "dark",
    });
  });

  it("uses the parchment stats-box and dark ink for giant rats", () => {
    expect(lookupMonsterCard("Giant Rats").statsBox).toEqual({
      topPercent: 74,
      heightPercent: 17,
      ink: "dark",
    });
  });

  it("omits art and clip when the monster is unknown", () => {
    const assets = lookupMonsterCard("Owlbear");

    expect(assets.imageHref).toBe(undefined);
    expect(assets.clipHref).toBe(undefined);
    expect(assets.statsBox).toEqual({
      topPercent: 74.8,
      heightPercent: 16,
      ink: "dark",
    });
  });
});
