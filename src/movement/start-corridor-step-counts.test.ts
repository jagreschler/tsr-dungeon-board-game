import { describe, expect, it } from "vitest";
import { dungeonBoard } from "../board/dungeon-board.ts";
import { findSpace } from "../board/find-space.ts";
import { listMoveStepCounts } from "./list-spaces-a-hero-can-move-to.ts";

function spacesAreLinked(
  fromSpaceIdentifier: string,
  toSpaceIdentifier: string,
): boolean {
  return dungeonBoard.connections.some((connection) => {
    return (
      connection.fromSpaceIdentifier === fromSpaceIdentifier &&
      connection.toSpaceIdentifier === toSpaceIdentifier
    );
  });
}

function listStartCorridorStepViolations(): string[] {
  const steps = listMoveStepCounts(dungeonBoard, "main-staircase", []);
  const seen = new Set<string>();
  const violations: string[] = [];

  for (const connection of dungeonBoard.connections) {
    const fromIdentifier = connection.fromSpaceIdentifier;
    const toIdentifier = connection.toSpaceIdentifier;
    const pairKey = [fromIdentifier, toIdentifier].sort().join(" ");
    if (seen.has(pairKey)) {
      continue;
    }

    seen.add(pairKey);

    const fromSpace = findSpace(dungeonBoard, fromIdentifier);
    const toSpace = findSpace(dungeonBoard, toIdentifier);
    if (fromSpace?.kind !== "corridor" || toSpace?.kind !== "corridor") {
      continue;
    }

    const fromSteps = steps.get(fromIdentifier);
    const toSteps = steps.get(toIdentifier);
    if (fromSteps === undefined || toSteps === undefined) {
      continue;
    }

    if (connection.kind === "door" || connection.kind === "secretDoor") {
      continue;
    }

    if (fromSteps !== toSteps) {
      continue;
    }

    violations.push(
      `${fromIdentifier} (${fromSteps}) / ${toIdentifier} (${toSteps})`,
    );
  }

  return violations.sort();
}

describe("Start corridor step counts", () => {
  it("does not link Start to the second northeast square", () => {
    const steps = listMoveStepCounts(dungeonBoard, "main-staircase", []);

    expect(
      spacesAreLinked("main-staircase", "corridor-1319-730"),
    ).toBe(false);
    expect(
      spacesAreLinked("corridor-1319-730", "main-staircase"),
    ).toBe(false);
    expect(steps.has("corridor-1319-730")).toBe(false);
  });

  it("does not link the west stub to the north bump", () => {
    const steps = listMoveStepCounts(dungeonBoard, "main-staircase", []);

    expect(
      spacesAreLinked("corridor-1045-800", "corridor-1011-741"),
    ).toBe(false);
    expect(
      spacesAreLinked("corridor-1011-741", "corridor-1045-800"),
    ).toBe(false);
    expect(steps.get("corridor-1011-741")).toBe(3);
  });

  it("does not give linked Start-glow corridor neighbors the same step count", () => {
    expect(listStartCorridorStepViolations()).toEqual([]);
  });
});
