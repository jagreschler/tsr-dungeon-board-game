import { monsterSlug } from "./lookup-monster-card.ts";

export type MonsterCombatValues = {
  name: string;
  lightning: number;
  fireball: number;
  wizard: number;
  superhero: number;
  hero: number;
  elf: number;
};

const goblinsCombatValues: MonsterCombatValues = {
  name: "Goblins",
  lightning: 6,
  fireball: 2,
  wizard: 5,
  superhero: 2,
  hero: 4,
  elf: 3,
};

// 1981 TSR numbers from the Magister Rex card list:
// https://magisterrex.wordpress.com/2011/04/11/whats-in-that-game-box-dungeon-fantasy-boardgame/
const hobgoblinsCombatValues: MonsterCombatValues = {
  name: "Hobgoblins",
  lightning: 3,
  fireball: 3,
  wizard: 6,
  superhero: 3,
  hero: 5,
  elf: 4,
};

const combatValuesBySlug: Record<string, MonsterCombatValues> = {
  goblins: goblinsCombatValues,
  hobgoblins: hobgoblinsCombatValues,
};

export function monsterCombatValues(
  monsterName: string,
): MonsterCombatValues | undefined {
  return combatValuesBySlug[monsterSlug(monsterName)];
}
