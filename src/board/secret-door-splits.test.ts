import { describe, expect, it } from "vitest";
import { dungeonBoard } from "./dungeon-board.ts";
import { dungeonLayout } from "./dungeon-layout.ts";
import { findPlacement } from "./find-placement.ts";
import { findSpace } from "./find-space.ts";
import { boxFromPlacement } from "./placement-box.ts";
import { listConnectedSpaceIdentifiers } from "../movement/list-connected-space-identifiers.ts";
import { listNeighborSpacesAHeroCanStepTo } from "../movement/list-neighbor-spaces-a-hero-can-step-to.ts";
import { storedDoorMarkInkGaps } from "../debug-tools/stored-door-mark-ink-gaps.ts";

function connectionKind(from: string, to: string) {
  const connection = dungeonBoard.connections.find((candidate) => {
    return (
      candidate.fromSpaceIdentifier === from &&
      candidate.toSpaceIdentifier === to
    );
  });

  return connection?.kind;
}

function expectBox(
  identifier: string,
  box: { x: number; y: number; width: number; height: number },
) {
  const placement = findPlacement(dungeonLayout, identifier);

  expect(placement === undefined, `${identifier} is missing`).toBe(false);
  if (placement === undefined) {
    return;
  }

  expect(boxFromPlacement(placement)).toEqual(box);
}

function expectKind(identifier: string, kind: string, level?: number) {
  const space = findSpace(dungeonBoard, identifier);

  expect(space === undefined, `${identifier} is missing`).toBe(false);
  expect(space?.kind).toBe(kind);
  if (space === undefined) {
    return;
  }

  if (space.kind === "room") {
    expect(space.level).toBe(level);
    return;
  }

  expect("level" in space).toBe(false);
}

function reachableWhenSecretsAreFound(): Set<string> {
  const found = dungeonBoard.connections.filter((connection) => {
    return connection.kind === "secretDoor";
  });

  return listConnectedSpaceIdentifiers("main-staircase", (spaceIdentifier) => {
    return listNeighborSpacesAHeroCanStepTo(
      dungeonBoard,
      spaceIdentifier,
      found,
    ).map((space) => space.identifier);
  });
}

describe("torture chamber secret-door split", () => {
  const chamber = "torture-chamber";
  const alcove = "corridor-1167-1389";

  it("keeps the named chamber and adds the east alcove as a corridor", () => {
    expectKind(chamber, "chamber");
    expect(findSpace(dungeonBoard, chamber)?.printedName).toBe(
      "Torture Chamber",
    );
    expectBox(chamber, { x: 983, y: 1267, width: 153, height: 143 });
    expectKind(alcove, "corridor");
    expectBox(alcove, { x: 1143, y: 1370, width: 49, height: 39 });
  });

  it("joins the two halves with a secret door and leaves the hall links on the chamber", () => {
    expect(connectionKind(chamber, alcove)).toBe("secretDoor");
    expect(connectionKind(alcove, chamber)).toBe("secretDoor");

    for (const hall of [
      "corridor-1078-1246",
      "corridor-949-1298",
      "corridor-1155-1317",
    ]) {
      expect(connectionKind(chamber, hall)).toBe("open");
      expect(connectionKind(alcove, hall)).toBe(undefined);
    }
  });

  it("hides the alcove until the secret door is found, then both are reachable from Start", () => {
    const before = listNeighborSpacesAHeroCanStepTo(dungeonBoard, chamber, []);

    expect(
      before.some((space) => space.identifier === alcove),
    ).toBe(false);

    const reachable = reachableWhenSecretsAreFound();

    expect(reachable.has(chamber)).toBe(true);
    expect(reachable.has(alcove)).toBe(true);
  });
});

describe("room-2-05 secret-door split", () => {
  const hall = "corridor-336-520";
  const north = "corridor-351-449";

  it("keeps the north flagstone and treats the old room as the corridor under it", () => {
    expect(findSpace(dungeonBoard, "room-2-05")).toBeUndefined();
    expectKind(hall, "corridor");
    expectBox(hall, { x: 316, y: 481, width: 40, height: 79 });
    expectKind(north, "corridor");
    expectBox(north, { x: 322, y: 434, width: 58, height: 31 });
  });

  it("puts the vestibule opening on the north half and the other links on the south hall", () => {
    expect(connectionKind(hall, north)).toBe("secretDoor");
    expect(connectionKind(north, hall)).toBe("secretDoor");
    expect(connectionKind(north, "corridor-401-453")).toBe("open");
    expect(connectionKind(hall, "corridor-401-453")).toBe(undefined);
    expect(connectionKind(hall, "corridor-337-584")).toBe("open");
    expect(connectionKind(hall, "room-level-03-orange-08")).toBe("door");
    expect(connectionKind(hall, "room-level-03-orange-09")).toBe(undefined);
    expect(connectionKind(north, "room-level-03-orange-09")).toBe(undefined);
    expect(connectionKind(north, "room-level-03-orange-08")).toBe(undefined);
    expect(connectionKind(north, "corridor-337-584")).toBe(undefined);
  });

  it("does not keep a secret-door mark from the south hall into room-level-03-orange-09", () => {
    expect(storedDoorMarkInkGaps.has("corridor-336-520 room-level-03-orange-09")).toBe(
      false,
    );
    expect(storedDoorMarkInkGaps.has("corridor-351-449 room-level-03-orange-09")).toBe(
      false,
    );
  });
});

describe("room-level-03-orange-11 secret-door split", () => {
  const upper = "room-level-03-orange-11";
  const lower = "room-level-03-orange-13";

  it("splits the stacked orange rooms and keeps both on level 3", () => {
    expectKind(upper, "room", 3);
    expectBox(upper, { x: 341, y: 1284, width: 94, height: 65 });
    expectKind(lower, "room", 3);
    expectBox(lower, { x: 351, y: 1365, width: 70, height: 86 });
  });

  it("puts the east hall door on the upper room and the room-level-03-orange-16 mark on the lower room", () => {
    expect(connectionKind(upper, lower)).toBe("secretDoor");
    expect(connectionKind(lower, upper)).toBe("secretDoor");
    expect(connectionKind(upper, "corridor-464-1279")).toBe("door");
    expect(connectionKind(lower, "corridor-464-1279")).toBe(undefined);
    expect(connectionKind(upper, "room-level-03-orange-16")).toBe(undefined);
    expect(connectionKind(lower, "room-level-03-orange-16")).toBe(undefined);
    expect(storedDoorMarkInkGaps.has("room-level-03-orange-11 room-level-03-orange-16")).toBe(false);
    expect(storedDoorMarkInkGaps.has("room-level-03-orange-13 room-level-03-orange-16")).toBe(true);
  });

  it("reaches both orange rooms from Start once the secret door is found", () => {
    const reachable = reachableWhenSecretsAreFound();

    expect(reachable.has(upper)).toBe(true);
    expect(reachable.has(lower)).toBe(true);
  });
});

describe("west stairs secret-door split", () => {
  const stairs = "corridor-855-765";
  const north = "corridor-897-706";

  it("keeps the stair oval as a corridor and adds the north flagstone", () => {
    expect(findSpace(dungeonBoard, "stairs-west")).toBeUndefined();
    expectKind(stairs, "corridor");
    expectBox(stairs, { x: 811, y: 741, width: 89, height: 48 });
    expectKind(north, "corridor");
    expectBox(north, { x: 870, y: 682, width: 54, height: 49 });
  });

  it("puts the northeast hall on the flagstone and the other links on the stairs", () => {
    expect(connectionKind(stairs, north)).toBe("secretDoor");
    expect(connectionKind(north, stairs)).toBe("secretDoor");
    expect(connectionKind(north, "corridor-934-689")).toBe("open");
    expect(connectionKind(stairs, "corridor-934-689")).toBe(undefined);
    expect(connectionKind(stairs, "room-level-02-green-02")).toBe("door");
    expect(connectionKind(stairs, "corridor-792-768")).toBe("open");
    expect(connectionKind(stairs, "corridor-909-774")).toBe("open");
    expect(connectionKind(north, "room-level-02-green-02")).toBe(undefined);
    expect(storedDoorMarkInkGaps.has("corridor-855-765 room-level-02-green-02")).toBe(true);
  });

  it("blocks the north flagstone from the stairs until the secret door is found", () => {
    const before = listNeighborSpacesAHeroCanStepTo(dungeonBoard, stairs, []);
    const after = listNeighborSpacesAHeroCanStepTo(dungeonBoard, stairs, [
      { fromSpaceIdentifier: stairs, toSpaceIdentifier: north },
    ]);

    expect(before.some((space) => space.identifier === north)).toBe(false);
    expect(after.some((space) => space.identifier === north)).toBe(true);
  });
});
