import { afterEach, describe, expect, it } from "vitest";
import { EVENT_MONSTER_CARD_DRAWN } from "./monster-card-stock.ts";
import { MonsterCardOverlay } from "./monster-card-overlay.ts";
import { MonsterCardScreen } from "./monster-card-screen.ts";

afterEach(() => {
  document.body.replaceChildren();
});

describe("MonsterCardScreen", () => {
  it("shows the overlay after MonsterCardDrawn", () => {
    const overlay = new MonsterCardOverlay(document.body);
    const screen = new MonsterCardScreen(overlay);
    const stock = new EventTarget();
    screen.listenForMonsterCardDrawn(stock);

    stock.dispatchEvent(
      new CustomEvent(EVENT_MONSTER_CARD_DRAWN, {
        detail: { monsterName: "Skeleton" },
      }),
    );

    const card = document.querySelector("[data-monster-card]");
    expect(card?.getAttribute("data-plain-card")).toBe("true");
    expect(document.body.textContent?.includes("Skeleton")).toBe(true);
  });
});
