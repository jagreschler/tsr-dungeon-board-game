import { describe, expect, it } from "vitest";
import { dungeonBoard } from "./dungeon-board.ts";
import { dungeonLayout } from "./dungeon-layout.ts";
import { findPlacement } from "./find-placement.ts";
import { findSpace } from "./find-space.ts";
import { boxFromPlacement } from "./placement-box.ts";
import { storedDoorMarkInkGaps } from "../debug-tools/stored-door-mark-ink-gaps.ts";
import { listConnectedSpaceIdentifiers } from "../movement/list-connected-space-identifiers.ts";
import { listNeighborSpacesAHeroCanStepTo } from "../movement/list-neighbor-spaces-a-hero-can-step-to.ts";
import type { OutlinePoint } from "./traced-space.ts";

const MERGED_SOUTH_SQUARE = "corridor-1004-1495";
const MOVED_YELLOW_SQUARE = "corridor-1567-765";
const CARAMEL_WEST_SQUARE = "corridor-1365-1028";

function connectionKind(left: string, right: string) {
  const connection = dungeonBoard.connections.find((candidate) => {
    return (
      candidate.fromSpaceIdentifier === left &&
      candidate.toSpaceIdentifier === right
    );
  });

  return connection?.kind;
}

function markKey(left: string, right: string): string {
  return [left, right].sort().join(" ");
}

function pointInPolygon(x: number, y: number, polygon: OutlinePoint[]): boolean {
  let inside = false;

  for (
    let index = 0, previous = polygon.length - 1;
    index < polygon.length;
    previous = index, index += 1
  ) {
    const current = polygon[index];
    const prior = polygon[previous];
    if (current === undefined || prior === undefined) {
      continue;
    }

    const crosses = (current.y > y) !== (prior.y > y);
    const xAtY =
      ((prior.x - current.x) * (y - current.y)) / (prior.y - current.y) +
      current.x;
    if (crosses && x < xAtY) {
      inside = inside === false;
    }
  }

  return inside;
}

describe("DUN-40 map fixes", () => {
  it("doors corridor-313-1411 into room-level-03-orange-13", () => {
    expect(
      connectionKind("corridor-313-1411", "room-level-03-orange-13"),
    ).toBe("door");
    expect(
      storedDoorMarkInkGaps.has(
        markKey("corridor-313-1411", "room-level-03-orange-13"),
      ),
    ).toBe(true);
  });

  it("keeps one corridor for the square that was split into 989-1495 and 1019-1495", () => {
    expect(findSpace(dungeonBoard, "corridor-989-1495")).toBeUndefined();
    expect(findSpace(dungeonBoard, "corridor-1019-1495")).toBeUndefined();
    expect(connectionKind("corridor-989-1495", "corridor-1019-1495")).toBe(
      undefined,
    );

    const square = findSpace(dungeonBoard, MERGED_SOUTH_SQUARE);
    const placement = findPlacement(dungeonLayout, MERGED_SOUTH_SQUARE);
    expect(square?.kind).toBe("corridor");
    expect(placement === undefined).toBe(false);
    if (placement === undefined) {
      return;
    }

    const box = boxFromPlacement(placement);
    expect(box.x).toBeLessThanOrEqual(974);
    expect(box.x + box.width).toBeGreaterThanOrEqual(1034);
    expect(box.y).toBeLessThanOrEqual(1479);
    expect(box.y + box.height).toBeGreaterThanOrEqual(1511);
    expect(connectionKind(MERGED_SOUTH_SQUARE, "corridor-949-1495")).toBe(
      "open",
    );
    expect(connectionKind(MERGED_SOUTH_SQUARE, "corridor-1047-1494")).toBe(
      "open",
    );
  });

  it("does not link room-level-06-blue-01 to room-level-06-blue-02", () => {
    expect(
      connectionKind("room-level-06-blue-01", "room-level-06-blue-02"),
    ).toBeUndefined();
    expect(
      connectionKind("room-level-06-blue-02", "room-level-06-blue-01"),
    ).toBeUndefined();
    expect(
      storedDoorMarkInkGaps.has(
        markKey("room-level-06-blue-01", "room-level-06-blue-02"),
      ),
    ).toBe(false);
  });

  it("sets the yellow square by room-level-06-blue-04 on the printed flagstone", () => {
    expect(findSpace(dungeonBoard, "corridor-1567-755")).toBeUndefined();

    const square = findSpace(dungeonBoard, MOVED_YELLOW_SQUARE);
    const placement = findPlacement(dungeonLayout, MOVED_YELLOW_SQUARE);
    expect(square?.kind).toBe("corridor");
    expect(placement === undefined).toBe(false);
    if (placement === undefined) {
      return;
    }

    const box = boxFromPlacement(placement);
    expect(box.y).toBeGreaterThanOrEqual(745);
    expect(box.y).toBeLessThanOrEqual(750);
    expect(connectionKind(MOVED_YELLOW_SQUARE, "room-level-06-blue-04")).toBe(
      "secretDoor",
    );
    expect(connectionKind(MOVED_YELLOW_SQUARE, "room-level-06-blue-07")).toBe(
      "secretDoor",
    );
    expect(
      storedDoorMarkInkGaps.has(
        markKey(MOVED_YELLOW_SQUARE, "room-level-06-blue-04"),
      ),
    ).toBe(true);
    expect(
      storedDoorMarkInkGaps.has(
        markKey(MOVED_YELLOW_SQUARE, "room-level-06-blue-07"),
      ),
    ).toBe(true);
  });

  it("joins the wizard rooms through the corridor between them", () => {
    expect(
      connectionKind("wizards-treasure-room", "wizards-laboratory"),
    ).toBeUndefined();
    expect(
      connectionKind("wizards-laboratory", "wizards-treasure-room"),
    ).toBeUndefined();
    expect(
      storedDoorMarkInkGaps.has(
        markKey("wizards-laboratory", "wizards-treasure-room"),
      ),
    ).toBe(false);
    expect(
      connectionKind("wizards-treasure-room", "corridor-1671-350"),
    ).toBe("door");
    expect(connectionKind("wizards-laboratory", "corridor-1671-350")).toBe(
      "open",
    );
    expect(
      storedDoorMarkInkGaps.has(
        markKey("wizards-laboratory", "corridor-1671-350"),
      ),
    ).toBe(false);
  });

  it("keeps the Main Staircase as the one safe start on the central circle", () => {
    const staircase = findSpace(dungeonBoard, "main-staircase");

    expect(findSpace(dungeonBoard, "main-gallery")).toBeUndefined();
    expect(staircase?.kind).toBe("mainStaircase");
    expect(staircase?.isStart).toBe(true);
    expect(staircase?.isSafe).toBe(true);
    expect(connectionKind("main-staircase", "main-gallery")).toBeUndefined();
    expect(connectionKind("main-staircase", "corridor-1098-942")).toBe("open");
    expect(connectionKind("main-staircase", "corridor-1045-800")).toBe("open");
    expect(connectionKind("main-staircase", "corridor-1304-898")).toBe("open");
    expect(connectionKind("main-staircase", "corridor-1197-970")).toBe("open");

    const reachable = listConnectedSpaceIdentifiers(
      "main-staircase",
      (spaceIdentifier) => {
        return listNeighborSpacesAHeroCanStepTo(
          dungeonBoard,
          spaceIdentifier,
          dungeonBoard.connections.filter((connection) => {
            return connection.kind === "secretDoor";
          }),
        ).map((space) => space.identifier);
      },
    );

    expect(reachable.size).toBe(dungeonBoard.spaces.length);
  });

  it("splits the yellow square out of room-level-01-caramel-07", () => {
    const room = findPlacement(dungeonLayout, "room-level-01-caramel-07");
    const square = findSpace(dungeonBoard, CARAMEL_WEST_SQUARE);
    const placement = findPlacement(dungeonLayout, CARAMEL_WEST_SQUARE);

    expect(room === undefined).toBe(false);
    expect(square?.kind).toBe("corridor");
    expect(placement === undefined).toBe(false);
    if (room === undefined || placement === undefined) {
      return;
    }

    const box = boxFromPlacement(placement);
    const centerX = box.x + box.width / 2;
    const centerY = box.y + box.height / 2;
    expect(pointInPolygon(centerX, centerY, room.outline)).toBe(false);
    expect(connectionKind(CARAMEL_WEST_SQUARE, "room-level-01-caramel-07")).toBe(
      "door",
    );
    expect(
      storedDoorMarkInkGaps.has(
        markKey(CARAMEL_WEST_SQUARE, "room-level-01-caramel-07"),
      ),
    ).toBe(true);
    expect(connectionKind(CARAMEL_WEST_SQUARE, "corridor-1385-982")).toBe(
      "open",
    );
    expect(connectionKind(CARAMEL_WEST_SQUARE, "corridor-1363-1074")).toBe(
      "open",
    );
    expect(
      connectionKind("room-level-01-caramel-07", "corridor-1385-982"),
    ).toBeUndefined();
    expect(
      connectionKind("room-level-01-caramel-07", "corridor-1363-1074"),
    ).toBeUndefined();
    expect(
      storedDoorMarkInkGaps.has(
        markKey("corridor-1385-982", "room-level-01-caramel-07"),
      ),
    ).toBe(false);
  });
});
