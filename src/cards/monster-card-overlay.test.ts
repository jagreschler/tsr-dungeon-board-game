import { afterEach, describe, expect, it } from "vitest";
import { lookupMonsterCard } from "./lookup-monster-card.ts";
import { monsterCombatValues } from "./monster-combat-values.ts";
import {
  CARD_REVEALED_EVENT,
  MonsterCardOverlay,
  OVERLAY_CLOSED_EVENT,
} from "./monster-card-overlay.ts";

const revealedEvents: string[] = [];

afterEach(() => {
  document.body.replaceChildren();
  revealedEvents.length = 0;
});

function goblinsOverlay(): MonsterCardOverlay {
  const overlay = new MonsterCardOverlay(document.body);
  overlay.addEventListener(CARD_REVEALED_EVENT, () => {
    revealedEvents.push(CARD_REVEALED_EVENT);
  });
  overlay.addEventListener(OVERLAY_CLOSED_EVENT, () => {
    revealedEvents.push(OVERLAY_CLOSED_EVENT);
  });
  return overlay;
}

describe("MonsterCardOverlay", () => {
  it("plays a muted clip first with a Skip button", () => {
    const assets = lookupMonsterCard(1, "Goblins");
    const values = monsterCombatValues("Goblins");
    goblinsOverlay().show(assets, values);

    const overlay = document.querySelector("[data-monster-card-overlay]");
    const video = overlay?.querySelector("video");
    const skip = overlay?.querySelector("[data-skip-clip]");
    const cardStep = overlay?.querySelector("[data-card-step]");

    expect(overlay === null).toBe(false);
    expect(video?.muted).toBe(true);
    expect(video?.getAttribute("src") ?? "").toContain("L1-goblins.mp4");
    expect(skip?.textContent).toBe("Skip");
    expect(cardStep?.hasAttribute("hidden")).toBe(true);
    expect(revealedEvents).toEqual([]);
  });

  it("shows the goblins card after Skip, with name and 1981 numbers", () => {
    const assets = lookupMonsterCard(1, "Goblins");
    const values = monsterCombatValues("Goblins");
    goblinsOverlay().show(assets, values);

    document.querySelector("[data-skip-clip]")?.dispatchEvent(
      new MouseEvent("click", { bubbles: true }),
    );

    const overlay = document.querySelector("[data-monster-card-overlay]");
    const clipStep = overlay?.querySelector("[data-clip-step]");
    const card = overlay?.querySelector("[data-monster-card]");
    const text = overlay?.textContent ?? "";

    expect(clipStep?.hasAttribute("hidden")).toBe(true);
    expect(card?.getAttribute("data-card-style")).toBe("red");
    expect(card?.querySelector("img")?.getAttribute("src") ?? "").toContain(
      "L1-goblins.jpg",
    );
    expect(text.includes("Goblins")).toBe(true);
    expect(text.includes("Lightning 6")).toBe(true);
    expect(text.includes("Fireball 2")).toBe(true);
    expect(text.includes("Wizard 5")).toBe(true);
    expect(text.includes("Superhero 2")).toBe(true);
    expect(text.includes("Hero 4")).toBe(true);
    expect(text.includes("Elf 3")).toBe(true);
    expect(overlay?.querySelector("[data-close-card]")?.textContent).toBe(
      "Close",
    );
    expect(revealedEvents).toEqual([CARD_REVEALED_EVENT]);
  });

  it("falls back to the card when there is no clip", () => {
    const assets = lookupMonsterCard(1, "Goblins");
    const values = monsterCombatValues("Goblins");
    goblinsOverlay().show({ ...assets, clipHref: undefined }, values);

    const overlay = document.querySelector("[data-monster-card-overlay]");
    const video = overlay?.querySelector("video");
    const skip = overlay?.querySelector("[data-skip-clip]");
    const text = overlay?.textContent ?? "";

    expect(video === null).toBe(true);
    expect(skip === null).toBe(true);
    expect(overlay?.querySelector("[data-card-step]")?.hasAttribute("hidden")).toBe(
      false,
    );
    expect(text.includes("Goblins")).toBe(true);
    expect(text.includes("Lightning 6")).toBe(true);
    expect(revealedEvents).toEqual([CARD_REVEALED_EVENT]);
  });

  it("removes the overlay when Close is pressed", () => {
    const assets = lookupMonsterCard(1, "Goblins");
    const values = monsterCombatValues("Goblins");
    goblinsOverlay().show({ ...assets, clipHref: undefined }, values);

    document.querySelector("[data-close-card]")?.dispatchEvent(
      new MouseEvent("click", { bubbles: true }),
    );

    expect(document.querySelector("[data-monster-card-overlay]") === null).toBe(
      true,
    );
    expect(revealedEvents).toEqual([
      CARD_REVEALED_EVENT,
      OVERLAY_CLOSED_EVENT,
    ]);
  });

  it("shows the card when the muted clip ends", () => {
    const assets = lookupMonsterCard(1, "Goblins");
    const values = monsterCombatValues("Goblins");
    goblinsOverlay().show(assets, values);

    const video = document.querySelector("video");
    video?.dispatchEvent(new Event("ended"));

    expect(
      document.querySelector("[data-card-step]")?.hasAttribute("hidden"),
    ).toBe(false);
    expect(revealedEvents).toEqual([CARD_REVEALED_EVENT]);
  });
});
