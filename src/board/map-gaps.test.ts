import { describe, expect, it } from "vitest";
import { dungeonBoard } from "./dungeon-board.ts";
import { findSpace } from "./find-space.ts";
import { listNeighborSpacesAHeroCanStepTo } from "../movement/list-neighbor-spaces-a-hero-can-step-to.ts";
import { listSpacesAHeroCanMoveTo } from "../movement/list-spaces-a-hero-can-move-to.ts";

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

describe("level 4 sure map gaps", () => {
  it("joins corridor-1244-256 to corridor-1244-318 with a secret door", () => {
    expect(connectionKind("corridor-1244-256", "corridor-1244-318")).toBe(
      "secretDoor",
    );
  });

  it("joins corridor-1244-318 to corridor-1244-381 with a secret door", () => {
    expect(connectionKind("corridor-1244-318", "corridor-1244-381")).toBe(
      "secretDoor",
    );
  });

  it("does not let corridor-1296-313 skip to corridor-1244-256", () => {
    expect(
      connectionKind("corridor-1296-313", "corridor-1244-256") === undefined,
    ).toBe(true);
  });

  it("does not let corridor-1296-313 skip to corridor-1244-381", () => {
    expect(
      connectionKind("corridor-1296-313", "corridor-1244-381") === undefined,
    ).toBe(true);
  });

  it("keeps the open hall from corridor-1296-313 into corridor-1244-318", () => {
    expect(connectionKind("corridor-1296-313", "corridor-1244-318")).toBe(
      "open",
    );
  });

  it("adds a secret door from room-4-06 to corridor-887-972", () => {
    expect(connectionKind("room-4-06", "corridor-887-972")).toBe("secretDoor");
  });

  it("opens the Torture Chamber into corridor-1155-1317", () => {
    expect(connectionKind("torture-chamber", "corridor-1155-1317")).toBe(
      "open",
    );
  });

  it("adds a door from room-4-09 to corridor-949-1298", () => {
    expect(connectionKind("room-4-09", "corridor-949-1298")).toBe("door");
  });

  it("adds a door from room-4-10 to corridor-1122-1246", () => {
    expect(connectionKind("room-4-10", "corridor-1122-1246")).toBe("door");
  });

  it("adds a door from room-4-12 to corridor-815-1426", () => {
    expect(connectionKind("room-4-12", "corridor-815-1426")).toBe("door");
  });

  it("adds a door from room-4-13 to corridor-889-1441", () => {
    expect(connectionKind("room-4-13", "corridor-889-1441")).toBe("door");
  });

  it("adds a door from room-4-14 to corridor-1300-1523", () => {
    expect(connectionKind("room-4-14", "corridor-1300-1523")).toBe("door");
  });

  it("adds a door from room-4-17 to corridor-713-1517", () => {
    expect(connectionKind("room-4-17", "corridor-713-1517")).toBe("door");
  });

  it("adds a door from room-4-18 to corridor-2044-1485", () => {
    expect(connectionKind("room-4-18", "corridor-2044-1485")).toBe("door");
  });
});
