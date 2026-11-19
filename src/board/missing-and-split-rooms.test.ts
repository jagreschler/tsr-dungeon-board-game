import { describe, expect, it } from "vitest";
import { dungeonBoard } from "./dungeon-board.ts";
import { dungeonLayout } from "./dungeon-layout.ts";
import { findPlacement } from "./find-placement.ts";
import { findSpace } from "./find-space.ts";
import { boxFromPlacement } from "./placement-box.ts";
import { listConnectedSpaceIdentifiers } from "../movement/list-connected-space-identifiers.ts";
import { listNeighborSpacesAHeroCanStepTo } from "../movement/list-neighbor-spaces-a-hero-can-step-to.ts";
import { storedDoorMarkInkGaps } from "../debug-tools/stored-door-mark-ink-gaps.ts";
import type { OutlinePoint } from "./traced-space.ts";

const RED_ROOM = "room-level-05-red-10";
const GREEN_ROOM = "room-level-02-green-06";
const LOWER_CYAN_ROOM = "room-level-06-blue-12";
const UPPER_CYAN_ROOM = "room-level-06-blue-09";
const YELLOW_SQUARE = "corridor-1567-765";

function connectionKind(left: string, right: string) {
  const connection = dungeonBoard.connections.find((candidate) => {
    return (
      candidate.fromSpaceIdentifier === left &&
      candidate.toSpaceIdentifier === right
    );
  });

  return connection?.kind;
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
    const xAtY = ((prior.x - current.x) * (y - current.y)) / (prior.y - current.y) + current.x;
    if (crosses && x < xAtY) {
      inside = inside === false;
    }
  }

  return inside;
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

describe("missing and split rooms", () => {
  it("gives the red room inside the Queen's Treasure Room its own level 5 space", () => {
    const room = findSpace(dungeonBoard, RED_ROOM);
    const placement = findPlacement(dungeonLayout, RED_ROOM);
    const queen = findPlacement(dungeonLayout, "queens-treasure-room");

    expect(room?.kind).toBe("room");
    if (room?.kind === "room") {
      expect(room.level).toBe(5);
    }
    expect(placement === undefined).toBe(false);
    expect(queen === undefined).toBe(false);
    if (placement === undefined || queen === undefined) {
      return;
    }

    const box = boxFromPlacement(placement);
    expect(box.x).toBeGreaterThanOrEqual(1490);
    expect(box.x + box.width).toBeLessThanOrEqual(1612);
    expect(box.y).toBeGreaterThanOrEqual(1090);
    expect(box.y + box.height).toBeLessThanOrEqual(1200);
    expect(pointInPolygon(box.x + box.width / 2, box.y + box.height / 2, queen.outline)).toBe(false);
    expect(connectionKind(RED_ROOM, "queens-treasure-room")).toBe("secretDoor");
  });

  it("adds the green room east of the Kitchen with one door", () => {
    const room = findSpace(dungeonBoard, GREEN_ROOM);
    const links = dungeonBoard.connections.filter((connection) => {
      return connection.fromSpaceIdentifier === GREEN_ROOM;
    });

    expect(room?.kind).toBe("room");
    if (room?.kind === "room") {
      expect(room.level).toBe(2);
    }
    expect(links.map((connection) => {
      return [connection.toSpaceIdentifier, connection.kind];
    })).toEqual([["corridor-478-1032", "door"]]);
    expect(storedDoorMarkInkGaps.has("corridor-478-1032 room-level-02-green-06")).toBe(true);
  });

  it("splits room-level-06-blue-12 into two level 6 rooms joined by the printed secret door", () => {
    const upper = findSpace(dungeonBoard, UPPER_CYAN_ROOM);
    const lower = findSpace(dungeonBoard, LOWER_CYAN_ROOM);
    const upperPlacement = findPlacement(dungeonLayout, UPPER_CYAN_ROOM);
    const lowerPlacement = findPlacement(dungeonLayout, LOWER_CYAN_ROOM);

    expect(upper?.kind).toBe("room");
    expect(lower?.kind).toBe("room");
    if (upper?.kind === "room") {
      expect(upper.level).toBe(6);
    }
    if (lower?.kind === "room") {
      expect(lower.level).toBe(6);
    }
    expect(upperPlacement === undefined).toBe(false);
    expect(lowerPlacement === undefined).toBe(false);
    if (upperPlacement === undefined || lowerPlacement === undefined) {
      return;
    }

    const upperBox = boxFromPlacement(upperPlacement);
    const lowerBox = boxFromPlacement(lowerPlacement);
    expect(upperBox.y + upperBox.height).toBeLessThanOrEqual(lowerBox.y + 8);
    expect(connectionKind(LOWER_CYAN_ROOM, UPPER_CYAN_ROOM)).toBe("secretDoor");
    expect(connectionKind(LOWER_CYAN_ROOM, "corridor-1662-1078")).toBe("door");
    expect(connectionKind(UPPER_CYAN_ROOM, "corridor-1662-1078")).toBeUndefined();
  });

  it("adds the yellow square between room-level-06-blue-04 and room-level-06-blue-07", () => {
    const square = findSpace(dungeonBoard, YELLOW_SQUARE);
    const room = findPlacement(dungeonLayout, "room-level-06-blue-04");

    expect(square?.kind).toBe("corridor");
    expect(room === undefined).toBe(false);
    if (room === undefined || square === undefined) {
      return;
    }

    const placement = findPlacement(dungeonLayout, YELLOW_SQUARE);
    expect(placement === undefined).toBe(false);
    if (placement === undefined) {
      return;
    }

    const box = boxFromPlacement(placement);
    expect(pointInPolygon(box.x + box.width / 2, box.y + box.height / 2, room.outline)).toBe(false);
    expect(connectionKind(YELLOW_SQUARE, "room-level-06-blue-04")).toBe("secretDoor");
    expect(connectionKind(YELLOW_SQUARE, "room-level-06-blue-07")).toBe("secretDoor");
  });

  it("does not link room-level-04-purple-17 to room-level-04-purple-18", () => {
    expect(connectionKind("room-level-04-purple-17", "room-level-04-purple-18")).toBeUndefined();
    expect(connectionKind("room-level-04-purple-18", "room-level-04-purple-17")).toBeUndefined();
    expect(storedDoorMarkInkGaps.has("room-level-04-purple-17 room-level-04-purple-18")).toBe(false);
  });

  it("joins the torture-chamber square to room-level-04-purple-18 with a door", () => {
    expect(connectionKind("corridor-1167-1389", "room-level-04-purple-18")).toBe("door");
    expect(storedDoorMarkInkGaps.has("corridor-1167-1389 room-level-04-purple-18")).toBe(true);
  });

  it("can reach room-level-04-purple-15 from the Main Staircase once secret doors are found", () => {
    const reachable = reachableWhenSecretsAreFound();

    expect(reachable.has("room-level-04-purple-15")).toBe(true);
    expect(reachable.has(RED_ROOM)).toBe(true);
    expect(reachable.has(GREEN_ROOM)).toBe(true);
    expect(reachable.has(UPPER_CYAN_ROOM)).toBe(true);
    expect(reachable.has(YELLOW_SQUARE)).toBe(true);
  });
});
