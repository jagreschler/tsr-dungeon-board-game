import { describe, expect, it } from "vitest";
import { monsterCombatValues } from "./monster-combat-values.ts";

describe("monsterCombatValues", () => {
  it("returns the 1981 Goblins numbers", () => {
    const values = monsterCombatValues("Goblins");

    expect(values?.name).toBe("Goblins");
    expect(values?.lightning).toBe(6);
    expect(values?.fireball).toBe(2);
    expect(values?.wizard).toBe(5);
    expect(values?.superhero).toBe(2);
    expect(values?.hero).toBe(4);
    expect(values?.elf).toBe(3);
  });

  it("returns the 1981 Hobgoblins numbers", () => {
    const values = monsterCombatValues("Hobgoblins");

    expect(values?.name).toBe("Hobgoblins");
    expect(values?.lightning).toBe(3);
    expect(values?.fireball).toBe(3);
    expect(values?.wizard).toBe(6);
    expect(values?.superhero).toBe(3);
    expect(values?.hero).toBe(5);
    expect(values?.elf).toBe(4);
  });

  it("returns undefined for an unknown monster", () => {
    expect(monsterCombatValues("Owlbear")).toBe(undefined);
  });
});
