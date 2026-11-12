import { describe, expect, it } from "vitest";
import {
  LEVEL_1_MONSTER_NAMES,
  MonsterDeck,
  shuffledLevel1MonsterDeck,
} from "./monster-deck.ts";

describe("MonsterDeck", () => {
  it("takes the top card and can put it on the bottom", () => {
    const deck = new MonsterDeck(["Goblins", "Skeleton", "Hobgoblins"]);

    expect(deck.takeTopCard()).toBe("Goblins");
    deck.putOnBottom("Goblins");
    expect(deck.takeTopCard()).toBe("Skeleton");
    expect(deck.takeTopCard()).toBe("Hobgoblins");
    expect(deck.takeTopCard()).toBe("Goblins");
    expect(deck.takeTopCard()).toBe(undefined);
  });

  it("shuffles with an injected random source", () => {
    const deck = new MonsterDeck(["A", "B", "C"]);
    const floats = [0, 0];
    deck.shuffle({
      nextFloat: () => floats.shift() ?? 0,
    });

    expect(deck.takeTopCard()).toBe("B");
    expect(deck.takeTopCard()).toBe("C");
    expect(deck.takeTopCard()).toBe("A");
  });

  it("builds the 1981 Level 1 deck of 7 cards", () => {
    expect(LEVEL_1_MONSTER_NAMES).toEqual([
      "Giant Lizard",
      "Giant Rats",
      "Giant Rats",
      "Goblins",
      "Goblins",
      "Hobgoblins",
      "Skeleton",
    ]);

    const deck = shuffledLevel1MonsterDeck({
      nextFloat: () => 0.999,
    });
    const drawn: string[] = [];
    for (let i = 0; i < 7; i++) {
      const name = deck.takeTopCard();
      if (name !== undefined) {
        drawn.push(name);
      }
    }

    expect(drawn).toEqual(LEVEL_1_MONSTER_NAMES);
  });
});
