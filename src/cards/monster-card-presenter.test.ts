import { afterEach, describe, expect, it } from "vitest";
import { EVENT_MONSTER_CARD_DRAWN } from "./monster-card-dealer.ts";
import { MonsterCardOverlay } from "./monster-card-overlay.ts";
import { MonsterCardPresenter } from "./monster-card-presenter.ts";

afterEach(() => {
  document.body.replaceChildren();
});

describe("MonsterCardPresenter", () => {
  it("shows the overlay after MonsterCardDrawn", () => {
    const overlay = new MonsterCardOverlay(document.body);
    const presenter = new MonsterCardPresenter(overlay);
    const dealer = new EventTarget();
    presenter.listenForMonsterCardDrawn(dealer);

    dealer.dispatchEvent(
      new CustomEvent(EVENT_MONSTER_CARD_DRAWN, {
        detail: { monsterName: "Skeleton" },
      }),
    );

    const card = document.querySelector("[data-monster-card]");
    expect(card?.getAttribute("data-plain-card")).toBe("true");
    expect(document.body.textContent?.includes("Skeleton")).toBe(true);
  });
});
