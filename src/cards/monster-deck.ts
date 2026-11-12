export type RandomSource = {
  nextFloat: () => number;
};

export const LEVEL_1_MONSTER_NAMES = [
  "Giant Lizard",
  "Giant Rats",
  "Giant Rats",
  "Goblins",
  "Goblins",
  "Hobgoblins",
  "Skeleton",
] as const;

export class MonsterDeck {
  private cards: string[];

  constructor(cards: readonly string[]) {
    this.cards = [...cards];
  }

  shuffle(random: RandomSource): void {
    for (let index = this.cards.length - 1; index > 0; index--) {
      const swapWith = Math.floor(random.nextFloat() * (index + 1));
      const left = this.cards[index];
      const right = this.cards[swapWith];
      if (left === undefined || right === undefined) {
        continue;
      }
      this.cards[index] = right;
      this.cards[swapWith] = left;
    }
  }

  takeTopCard(): string | undefined {
    return this.cards.shift();
  }

  putOnBottom(monsterName: string): void {
    this.cards.push(monsterName);
  }
}

export function shuffledLevel1MonsterDeck(
  random: RandomSource = { nextFloat: () => Math.random() },
): MonsterDeck {
  const deck = new MonsterDeck(LEVEL_1_MONSTER_NAMES);
  deck.shuffle(random);
  return deck;
}
