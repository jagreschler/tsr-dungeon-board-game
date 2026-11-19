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

function doorMark(left: string, right: string) {
  return storedDoorMarkInkGaps.get([left, right].sort().join(" "));
}

function placementBox(identifier: string) {
  const placement = findPlacement(dungeonLayout, identifier);

  if (placement === undefined) {
    throw new Error(`${identifier} is missing`);
  }

  return boxFromPlacement(placement);
}

function secretNeighbors(identifier: string): string[] {
  return dungeonBoard.connections
    .filter((connection) => {
      return (
        connection.fromSpaceIdentifier === identifier &&
        connection.kind === "secretDoor"
      );
    })
    .map((connection) => connection.toSpaceIdentifier)
    .sort();
}

function markSitsInTheGap(
  left: string,
  right: string,
  above: string,
  below: string,
): boolean {
  const gap = doorMark(left, right);
  if (gap === undefined) {
    return false;
  }

  const upper = placementBox(above);
  const lower = placementBox(below);
  const x0 = Math.max(upper.x, lower.x);
  const x1 = Math.min(upper.x + upper.width, lower.x + lower.width);
  const y0 = upper.y + upper.height;
  const y1 = lower.y;
  const inGap = (point: { x: number; y: number }) => {
    return point.x >= x0 && point.x <= x1 && point.y >= y0 && point.y <= y1;
  };

  return inGap(gap.start) && inGap(gap.end);
}

function markCrossesSharedVerticalEdge(
  left: string,
  right: string,
  west: string,
  east: string,
): boolean {
  const gap = doorMark(left, right);
  if (gap === undefined) {
    return false;
  }

  const westBox = placementBox(west);
  const eastBox = placementBox(east);
  const edgeX = westBox.x + westBox.width;
  const y0 = Math.max(westBox.y, eastBox.y);
  const y1 = Math.min(
    westBox.y + westBox.height,
    eastBox.y + eastBox.height,
  );
  const spanX = gap.end.x - gap.start.x;
  if (spanX === 0) {
    return false;
  }

  const t = (edgeX - gap.start.x) / spanX;
  if (t < 0 || t > 1) {
    return false;
  }

  const y = gap.start.y + t * (gap.end.y - gap.start.y);
  return y >= y0 && y <= y1;
}

function canStep(from: string, to: string, found: { from: string; to: string }[]) {
  return listNeighborSpacesAHeroCanStepTo(
    dungeonBoard,
    from,
    found.map((door) => {
      return {
        fromSpaceIdentifier: door.from,
        toSpaceIdentifier: door.to,
      };
    }),
  ).some((space) => space.identifier === to);
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

const removedRoomIdentifiers = [
  "room-2-05",
  "room-3-16",
  "room-6-01",
  "room-6-02",
];

describe("rooms that are corridors", () => {
  it("drops the old room ids from the board, its links, and its door marks", () => {
    for (const identifier of removedRoomIdentifiers) {
      expect(findSpace(dungeonBoard, identifier), identifier).toBeUndefined();
    }

    for (const connection of dungeonBoard.connections) {
      expect(removedRoomIdentifiers).not.toContain(
        connection.fromSpaceIdentifier,
      );
      expect(removedRoomIdentifiers).not.toContain(
        connection.toSpaceIdentifier,
      );
    }

    for (const key of storedDoorMarkInkGaps.keys()) {
      for (const identifier of removedRoomIdentifiers) {
        expect(key.includes(identifier), key).toBe(false);
      }
    }
  });

  describe("the yellow hall that was room-2-05", () => {
    const hall = "corridor-336-520";

    it("is a corridor on the old room's box", () => {
      expectKind(hall, "corridor");
      expectBox(hall, { x: 316, y: 481, width: 40, height: 79 });
    });

    it("is one secret door away from the north flagstone, and has no secret door to room-2-08", () => {
      expect(secretNeighbors(hall)).toEqual(["corridor-351-449"]);
      expect(secretNeighbors("corridor-351-449")).toEqual([hall]);
      expect(connectionKind(hall, "room-2-08")).toBe(undefined);
      expect(connectionKind(hall, "corridor-337-584")).toBe("open");
      expect(connectionKind(hall, "room-2-07")).toBe("door");
      expect(doorMark(hall, "room-2-08")).toBeUndefined();
      expect(doorMark(hall, "room-2-07") === undefined).toBe(false);
      expect(
        markSitsInTheGap(
          hall,
          "corridor-351-449",
          "corridor-351-449",
          hall,
        ),
      ).toBe(true);
    });

    it("blocks that one secret door until it is found", () => {
      expect(canStep(hall, "corridor-351-449", [])).toBe(false);
      expect(canStep(hall, "corridor-337-584", [])).toBe(true);
      expect(canStep(hall, "room-2-07", [])).toBe(true);
      expect(
        canStep(hall, "corridor-351-449", [
          { from: hall, to: "corridor-351-449" },
        ]),
      ).toBe(true);
    });
  });

  describe("room-4-16 split by the printed secret door", () => {
    const room = "room-4-16";
    const nub = "corridor-1411-1515";

    it("keeps the magenta room and adds the south flagstone as a corridor", () => {
      expectKind(room, "room", 4);
      expectBox(room, { x: 1345, y: 1405, width: 91, height: 76 });
      expectKind(nub, "corridor");
      expectBox(nub, { x: 1385, y: 1496, width: 53, height: 38 });
    });

    it("has exactly one secret door, between the flagstone and the room", () => {
      expect(secretNeighbors(nub)).toEqual([room]);
      expect(connectionKind(room, nub)).toBe("secretDoor");
      expect(connectionKind(nub, "corridor-1354-1517")).toBe("open");
      expect(connectionKind(nub, "corridor-1452-1517")).toBe("open");
      expect(connectionKind(room, "corridor-1384-1372")).toBe("door");
      expect(connectionKind(nub, "corridor-1384-1372")).toBe(undefined);
      expect(connectionKind(room, "corridor-1354-1517")).toBe(undefined);
      expect(connectionKind(room, "corridor-1452-1517")).toBe(undefined);
      expect(doorMark(nub, "corridor-1354-1517")).toBeUndefined();
      expect(doorMark(nub, "corridor-1452-1517")).toBeUndefined();
    });

    it("hides the room behind the flagstone's one secret door", () => {
      expect(canStep(nub, room, [])).toBe(false);
      expect(canStep(nub, "corridor-1354-1517", [])).toBe(true);
      expect(canStep(nub, "corridor-1452-1517", [])).toBe(true);
      expect(canStep(nub, room, [{ from: room, to: nub }])).toBe(true);
      expect(canStep(room, "corridor-1384-1372", [])).toBe(true);
    });
  });

  describe("the two halls that were room-3-16", () => {
    const upper = "corridor-1986-1495";
    const lower = "corridor-1982-1555";

    it("is two corridors from the line map, joined by an open hall", () => {
      expectKind(upper, "corridor");
      expectBox(upper, { x: 1964, y: 1466, width: 45, height: 58 });
      expectKind(lower, "corridor");
      expectBox(lower, { x: 1959, y: 1524, width: 46, height: 63 });
      expect(connectionKind(upper, lower)).toBe("open");
      expect(connectionKind(lower, upper)).toBe("open");
    });

    it("puts each old opening on the half that touches that neighbor", () => {
      expect(connectionKind(upper, "corridor-2044-1485")).toBe("open");
      expect(connectionKind(lower, "corridor-2044-1485")).toBe(undefined);
      expect(connectionKind(lower, "corridor-1937-1568")).toBe("open");
      expect(connectionKind(upper, "corridor-1937-1568")).toBe(undefined);
    });

    it("lets a hero walk between the two halls without finding a secret door", () => {
      expect(canStep(upper, lower, [])).toBe(true);
      expect(canStep(lower, upper, [])).toBe(true);
    });
  });

  describe("the two halls north of the King's Treasure Room", () => {
    const west = "corridor-1858-626";
    const east = "corridor-1920-626";

    it("replaces room-6-01 and room-6-02 with corridors on the same boxes", () => {
      expectKind(west, "corridor");
      expectBox(west, { x: 1827, y: 596, width: 62, height: 60 });
      expectKind(east, "corridor");
      expectBox(east, { x: 1889, y: 596, width: 62, height: 60 });
    });

    it("keeps the secret door between them and moves the other openings", () => {
      expect(connectionKind(west, east)).toBe("secretDoor");
      expect(connectionKind(east, west)).toBe("secretDoor");
      expect(connectionKind(west, "corridor-1799-637")).toBe("open");
      expect(connectionKind(east, "corridor-1799-637")).toBe(undefined);
      expect(connectionKind(east, "corridor-1931-674")).toBe("open");
      expect(connectionKind(east, "corridor-1925-566")).toBe("open");
      expect(connectionKind(west, "corridor-1931-674")).toBe(undefined);
      expect(connectionKind(west, "corridor-1925-566")).toBe(undefined);
      expect(
        markCrossesSharedVerticalEdge(west, east, west, east),
      ).toBe(true);
    });

    it("blocks the printed secret door until it is found", () => {
      expect(canStep(west, east, [])).toBe(false);
      expect(canStep(east, west, [])).toBe(false);
      expect(canStep(west, "corridor-1799-637", [])).toBe(true);
      expect(
        canStep(west, east, [{ from: west, to: east }]),
      ).toBe(true);
    });
  });

  it("can reach every new hall from the Main Staircase once every secret door is found", () => {
    const reachable = reachableWhenSecretsAreFound();

    for (const identifier of [
      "corridor-336-520",
      "corridor-1411-1515",
      "room-4-16",
      "corridor-1986-1495",
      "corridor-1982-1555",
      "corridor-1858-626",
      "corridor-1920-626",
    ]) {
      expect(reachable.has(identifier), identifier).toBe(true);
    }
  });
});
