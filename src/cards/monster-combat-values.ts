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

export function monsterCombatValues(
  monsterName: string,
): MonsterCombatValues | undefined {
  if (monsterName.trim().toLowerCase() !== "goblins") {
    return undefined;
  }

  return goblinsCombatValues;
}
