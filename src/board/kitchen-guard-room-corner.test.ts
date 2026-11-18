import { describe, expect, it } from "vitest";
import { dungeonBoard } from "./dungeon-board.ts";
import { findSpace } from "./find-space.ts";
import { listMoveStepCounts } from "../movement/list-spaces-a-hero-can-move-to.ts";

function spacesAreLinked(
  fromSpaceIdentifier: string,
  toSpaceIdentifier: string,
  kind: string,
): boolean {
  return dungeonBoard.connections.some((connection) => {
    return (
      connection.fromSpaceIdentifier === fromSpaceIdentifier &&
      connection.toSpaceIdentifier === toSpaceIdentifier &&
      connection.kind === kind
    );
  });
}

describe("kitchen and guard room corner", () => {
  it("joins 522-949 to 480-996 and has neither extra square", () => {
    expect(findSpace(dungeonBoard, "corridor-489-949")).toBe(undefined);
    expect(findSpace(dungeonBoard, "corridor-480-960")).toBe(undefined);
    expect(findSpace(dungeonBoard, "corridor-522-949") === undefined).toBe(
      false,
    );
    expect(findSpace(dungeonBoard, "corridor-480-996") === undefined).toBe(
      false,
    );

    expect(
      spacesAreLinked("corridor-522-949", "corridor-480-996", "open"),
    ).toBe(true);
    expect(
      spacesAreLinked("corridor-480-996", "corridor-522-949", "open"),
    ).toBe(true);
    expect(
      spacesAreLinked("council-room", "corridor-522-949", "door"),
    ).toBe(true);
    expect(
      spacesAreLinked("corridor-522-949", "council-room", "door"),
    ).toBe(true);
    expect(
      spacesAreLinked("corridor-480-996", "corridor-478-1032", "open"),
    ).toBe(true);

    const steps = listMoveStepCounts(dungeonBoard, "corridor-522-949", []);

    expect(steps.get("corridor-480-996")).toBe(1);
    expect(steps.get("corridor-478-1032")).toBe(2);
    expect(steps.get("council-room")).toBe(1);
  });
});
