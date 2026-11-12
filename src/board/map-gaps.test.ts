import { describe, expect, it } from "vitest";
import { dungeonBoard } from "./dungeon-board.ts";
import { findSpace } from "./find-space.ts";
import { listNeighborSpacesAHeroCanStepTo } from "../movement/list-neighbor-spaces-a-hero-can-step-to.ts";
import {
  listMoveStepCounts,
  listSpacesAHeroCanMoveTo,
} from "../movement/list-spaces-a-hero-can-move-to.ts";

const NORTH = "corridor-1116-162";
const UPPER = "corridor-1116-212";
const LOWER = "corridor-1124-272";
const SOUTH = "corridor-1124-318";

const FOUND_SECRET_DOOR = {
  fromSpaceIdentifier: UPPER,
  toSpaceIdentifier: LOWER,
};

function connectionKind(from: string, to: string) {
  const connection = dungeonBoard.connections.find((candidate) => {
    return (
      candidate.fromSpaceIdentifier === from &&
      candidate.toSpaceIdentifier === to
    );
  });

  return connection?.kind;
}

describe("corridor-1116-162 south gap", () => {
  it("adds two level-4 corridor squares between the dead end and corridor-1124-318", () => {
    const upper = findSpace(dungeonBoard, UPPER);
    const lower = findSpace(dungeonBoard, LOWER);

    expect(upper === undefined).toBe(false);
    expect(upper?.kind).toBe("corridor");
    expect(upper?.level).toBe(4);
    expect(lower === undefined).toBe(false);
    expect(lower?.kind).toBe("corridor");
    expect(lower?.level).toBe(4);
  });

  it("opens corridor-1116-162 south into the upper new square", () => {
    expect(connectionKind(NORTH, UPPER)).toBe("open");
  });

  it("opens the lower new square into corridor-1124-318", () => {
    expect(connectionKind(LOWER, SOUTH)).toBe("open");
  });

  it("joins the two new squares with a secret door", () => {
    expect(connectionKind(UPPER, LOWER)).toBe("secretDoor");
  });

  it("blocks a hero at corridor-1116-162 from passing the hidden door until it is found", () => {
    const neighborsBeforeFinding = listNeighborSpacesAHeroCanStepTo(
      dungeonBoard,
      UPPER,
      [],
    );
    const neighborsAfterFinding = listNeighborSpacesAHeroCanStepTo(
      dungeonBoard,
      UPPER,
      [FOUND_SECRET_DOOR],
    );
    const beforeFinding = listSpacesAHeroCanMoveTo(dungeonBoard, NORTH, []);
    const afterFinding = listSpacesAHeroCanMoveTo(dungeonBoard, NORTH, [
      FOUND_SECRET_DOOR,
    ]);

    expect(beforeFinding.has(UPPER)).toBe(true);
    expect(beforeFinding.has(LOWER)).toBe(false);
    expect(beforeFinding.has(SOUTH)).toBe(false);
    expect(
      neighborsBeforeFinding.some((space) => {
        return space.identifier === LOWER;
      }),
    ).toBe(false);
    expect(
      neighborsAfterFinding.some((space) => {
        return space.identifier === LOWER;
      }),
    ).toBe(true);
    expect(afterFinding.has(LOWER)).toBe(true);
    expect(afterFinding.has(SOUTH)).toBe(true);
  });
});

describe("room-west west door", () => {
  it("lets a hero on corridor-916-921 step into room-west", () => {
    const neighbors = listNeighborSpacesAHeroCanStepTo(
      dungeonBoard,
      "corridor-916-921",
      [],
    );
    const steps = listMoveStepCounts(dungeonBoard, "corridor-916-921", []);

    expect(
      neighbors.some((space) => space.identifier === "room-west"),
    ).toBe(true);
    expect(steps.get("room-west")).toBe(1);
  });
});
