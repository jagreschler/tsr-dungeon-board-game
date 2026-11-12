import { afterEach, describe, expect, it } from "vitest";
import { appendMonsterCardOverlay } from "./append-monster-card-overlay.ts";
import { lookupMonsterCard } from "./lookup-monster-card.ts";
import { monsterCombatValues } from "./monster-combat-values.ts";

afterEach(() => {
  document.body.replaceChildren();
});

function showCard(monsterName: string): HTMLElement {
  const assets = lookupMonsterCard(1, monsterName);
  const values = monsterCombatValues(monsterName);
  if (values === undefined) {
    throw new Error(`missing combat values for ${monsterName}`);
  }

  return appendMonsterCardOverlay(
    document.body,
    { ...assets, clipHref: undefined },
    values,
  );
}

function statsCaption(monsterName: string): HTMLElement {
  const caption = showCard(monsterName).querySelector(
    "[data-monster-card-stats]",
  );
  if (caption instanceof HTMLElement === false) {
    throw new Error("missing stats caption");
  }

  return caption;
}

describe("appendMonsterCardOverlay stats caption", () => {
  it("uses dark ink, the shared serif, and the parchment stats-box", () => {
    const caption = statsCaption("Hobgoblins");

    expect(caption.classList.contains("monster-card-stats-ink")).toBe(true);
    expect(caption.classList.contains("monster-card-stats")).toBe(true);
    expect(caption.getAttribute("data-stats-box")).toBe("true");
    expect(caption.querySelector(".monster-card-stats-name") === null).toBe(
      false,
    );
    expect(caption.querySelector(".monster-card-stats-columns") === null).toBe(
      false,
    );
  });

  it("uses parchment caption ink for Goblins and dark ink for Hobgoblins", () => {
    const goblins = statsCaption("Goblins");
    const hobgoblins = statsCaption("Hobgoblins");

    expect(goblins.classList.contains("monster-card-stats-parchment")).toBe(
      true,
    );
    expect(goblins.classList.contains("monster-card-stats-ink")).toBe(false);
    expect(hobgoblins.classList.contains("monster-card-stats-ink")).toBe(true);
    expect(hobgoblins.classList.contains("monster-card-stats-parchment")).toBe(
      false,
    );
  });

  it("places the caption using each card's stats-box percents", () => {
    const goblins = statsCaption("Goblins");
    const hobgoblins = statsCaption("Hobgoblins");
    const giantLizard = statsCaption("Giant Lizard");

    expect(goblins.style.top).toBe("76%");
    expect(goblins.style.height).toBe("20%");
    expect(hobgoblins.style.top).toBe("74.8%");
    expect(hobgoblins.style.height).toBe("16%");
    expect(giantLizard.style.top).toBe("67%");
    expect(giantLizard.style.height).toBe("19%");
  });
});
