import { afterEach, describe, expect, it } from "vitest";
import {
  MONSTER_CARD_DRAWN_EVENT,
  MONSTER_ROOM_ENTERED_EVENT,
  MonsterEncounter,
} from "./monster-encounter.ts";
import { MonsterDeck } from "./monster-deck.ts";
import { MonsterCardOverlay } from "./monster-card-overlay.ts";

afterEach(() => {
  document.body.replaceChildren();
});

describe("MonsterEncounter", () => {
  it("draws the top card after MonsterRoomEntered and shows it", () => {
    const deck = new MonsterDeck(["Skeleton", "Goblins"]);
    const overlay = new MonsterCardOverlay(document.body);
    const encounter = new MonsterEncounter(deck, overlay);
    const session = new EventTarget();
    const drawn: string[] = [];
    encounter.bindTo(session);
    encounter.addEventListener(MONSTER_CARD_DRAWN_EVENT, (event) => {
      if (event instanceof CustomEvent) {
        drawn.push(event.detail.monsterName);
      }
    });

    session.dispatchEvent(new CustomEvent(MONSTER_ROOM_ENTERED_EVENT));

    const card = document.querySelector("[data-monster-card]");
    expect(drawn).toEqual(["Skeleton"]);
    expect(card?.getAttribute("data-plain-card")).toBe("true");
    expect(document.body.textContent?.includes("Skeleton")).toBe(true);
  });

  it("puts the unfought card on the bottom when the overlay closes", () => {
    const deck = new MonsterDeck(["Skeleton", "Goblins"]);
    const overlay = new MonsterCardOverlay(document.body);
    const encounter = new MonsterEncounter(deck, overlay);
    const session = new EventTarget();
    encounter.bindTo(session);

    session.dispatchEvent(new CustomEvent(MONSTER_ROOM_ENTERED_EVENT));
    document.querySelector("[data-close-card]")?.dispatchEvent(
      new MouseEvent("click", { bubbles: true }),
    );

    expect(deck.takeTopCard()).toBe("Goblins");
    expect(deck.takeTopCard()).toBe("Skeleton");
  });
});
