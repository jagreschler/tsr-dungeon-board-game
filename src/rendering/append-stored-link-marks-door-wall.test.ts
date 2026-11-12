import { describe, expect, it } from "vitest";
import { dungeonBoard } from "../board/dungeon-board.ts";
import { dungeonLayout } from "../board/dungeon-layout.ts";
import { dungeonLinkTuples } from "../board/map-data/board-links.ts";
import { boxOutline } from "../board/box-outline.ts";
import { centerOfBox } from "../board/board-grid.ts";
import { boxFromPlacement } from "../board/placement-box.ts";
import { findPlacement } from "../board/find-placement.ts";
import { findSpace } from "../board/find-space.ts";
import type { SpacePlacement } from "../board/space-placement.ts";
import { appendStoredLinkMarks } from "./append-stored-link-marks.ts";
import { pointOnSharedWall } from "./shared-wall-point.ts";
import { SVG_NAMESPACE } from "./svg-namespace.ts";

function pairKey(left: string, right: string): string {
  return [left, right].sort().join(" ");
}

/**
 * Pending a data fix: these stored door and secret-door links have no
 * real shared wall on the print (wrong partner). Gray on these lines is
 * a map-data bug, not an overlay bug.
 */
const doorAndSecretLinksPendingADataFix: readonly [string, string][] = [
  ["room-2-03", "corridor-395-230"],
  ["corridor-1045-800", "room-west"],
  ["room-east-southeast", "corridor-1358-918"],
  ["wizards-laboratory", "corridor-1509-326"],
  ["room-east", "corridor-1417-934"],
  ["room-2-02", "corridor-638-260"],
  ["wizards-treasure-room", "wizards-laboratory"],
  ["queens-treasure-room-annex", "room-5-14"],
  ["room-4-09", "corridor-895-1283"],
  ["room-4-04", "corridor-874-243"],
  ["room-3-11", "corridor-478-1032"],
  ["room-5-10", "corridor-1923-439"],
  ["queens-treasure-room", "corridor-1815-1140"],
  ["room-2-01", "room-2-02"],
  ["armory", "room-2-05"],
  ["room-northeast", "corridor-1436-640"],
  ["room-2-09", "corridor-513-624"],
  ["room-6-03", "room-6-04"],
  ["room-5-09", "corridor-1354-371"],
  ["room-3-08", "corridor-1554-877"],
  ["room-3-14", "room-4-17"],
  ["room-northwest", "room-east-northeast"],
  ["room-2-02", "corridor-669-214"],
];

const pendingDataFixKeys = new Set(
  doorAndSecretLinksPendingADataFix.map((pair) => pairKey(pair[0], pair[1])),
);

const WALL_BAND_IN_PIXELS = 28;
const WALL_POINT_SLACK_IN_PIXELS = 16;

function isHallKind(kind: string): boolean {
  return kind === "corridor" || kind === "stairs" || kind === "mainStaircase";
}

function hasDoorWall(kind: string): boolean {
  return kind === "room" || kind === "chamber" || kind === "mainGallery";
}

function outlineOf(placement: SpacePlacement): { x: number; y: number }[] {
  if (placement.outline.length >= 2) {
    return placement.outline;
  }

  return boxOutline(
    placement.x,
    placement.y,
    placement.width,
    placement.height,
  );
}

function samePoint(
  left: { x: number; y: number },
  right: { x: number; y: number },
  slack = 0.05,
): boolean {
  return Math.hypot(left.x - right.x, left.y - right.y) <= slack;
}

function insideBox(
  box: { x: number; y: number; width: number; height: number },
  x: number,
  y: number,
): boolean {
  return (
    x >= box.x &&
    x <= box.x + box.width &&
    y >= box.y &&
    y <= box.y + box.height
  );
}

function distanceToBox(
  box: { x: number; y: number; width: number; height: number },
  x: number,
  y: number,
): number {
  const nearestX = Math.max(box.x, Math.min(x, box.x + box.width));
  const nearestY = Math.max(box.y, Math.min(y, box.y + box.height));
  return Math.hypot(x - nearestX, y - nearestY);
}

function abyssPixelsAlong(
  start: { x: number; y: number },
  end: { x: number; y: number },
  hallBox: { x: number; y: number; width: number; height: number },
  roomBox: { x: number; y: number; width: number; height: number },
): number {
  const distance = Math.hypot(end.x - start.x, end.y - start.y);
  const samples = Math.max(Math.ceil(distance * 2), 1);
  let abyss = 0;

  for (let index = 0; index <= samples; index += 1) {
    const along = index / samples;
    const x = start.x + (end.x - start.x) * along;
    const y = start.y + (end.y - start.y) * along;
    if (insideBox(hallBox, x, y) || insideBox(roomBox, x, y)) {
      continue;
    }

    if (
      distanceToBox(hallBox, x, y) <= WALL_BAND_IN_PIXELS &&
      distanceToBox(roomBox, x, y) <= WALL_BAND_IN_PIXELS
    ) {
      continue;
    }

    abyss += 1;
  }

  return abyss;
}

describe("stored door marks stop on the shared wall", () => {
  it("lists each pending data-fix pair once, and only stored door links", () => {
    const storedKeys = new Set(
      dungeonLinkTuples
        .filter((tuple) => tuple[2] === "door" || tuple[2] === "secretDoor")
        .map((tuple) => pairKey(tuple[0], tuple[1])),
    );

    expect(doorAndSecretLinksPendingADataFix).toHaveLength(23);
    expect(pendingDataFixKeys.size).toBe(23);
    for (const key of pendingDataFixKeys) {
      expect(storedKeys.has(key), `${key} should be a stored door or secret`).toBe(
        true,
      );
    }
  });

  it("draws every real shared-wall door from the hall center to the wall, with no abyss", () => {
    const parent = document.createElementNS(SVG_NAMESPACE, "g");
    const marks = appendStoredLinkMarks(parent, dungeonBoard, dungeonLayout);
    const lines = [...marks.querySelectorAll("[data-stored-link-mark]")];
    const checked: string[] = [];

    for (const line of lines) {
      const kind = line.getAttribute("data-link-kind");
      if (kind !== "door" && kind !== "secretDoor") {
        continue;
      }

      const fromIdentifier = line.getAttribute("data-from-space-identifier");
      const toIdentifier = line.getAttribute("data-to-space-identifier");
      if (fromIdentifier === null || toIdentifier === null) {
        continue;
      }

      const key = pairKey(fromIdentifier, toIdentifier);
      if (pendingDataFixKeys.has(key)) {
        continue;
      }

      const fromSpace = findSpace(dungeonBoard, fromIdentifier);
      const toSpace = findSpace(dungeonBoard, toIdentifier);
      const fromPlacement = findPlacement(dungeonLayout, fromIdentifier);
      const toPlacement = findPlacement(dungeonLayout, toIdentifier);
      if (
        fromSpace === undefined ||
        toSpace === undefined ||
        fromPlacement === undefined ||
        toPlacement === undefined
      ) {
        continue;
      }

      const fromCenter = centerOfBox(boxFromPlacement(fromPlacement));
      const toCenter = centerOfBox(boxFromPlacement(toPlacement));
      const fromIsHall = isHallKind(fromSpace.kind);
      const toIsHall = isHallKind(toSpace.kind);
      const fromHasWall = hasDoorWall(fromSpace.kind);
      const toHasWall = hasDoorWall(toSpace.kind);

      let hallPlacement = fromPlacement;
      let roomPlacement = toPlacement;
      let hallCenter = fromCenter;
      let roomCenter = toCenter;
      let wallOnRoom = true;
      if (toIsHall && fromHasWall && fromIsHall === false) {
        hallPlacement = toPlacement;
        roomPlacement = fromPlacement;
        hallCenter = toCenter;
        roomCenter = fromCenter;
        wallOnRoom = true;
      } else if (fromIsHall && toHasWall) {
        hallPlacement = fromPlacement;
        roomPlacement = toPlacement;
        hallCenter = fromCenter;
        roomCenter = toCenter;
        wallOnRoom = true;
      } else {
        wallOnRoom = false;
      }

      const hallOutline = outlineOf(hallPlacement);
      const roomOutline = outlineOf(roomPlacement);
      const wallPoint = wallOnRoom
        ? pointOnSharedWall(roomOutline, hallOutline)
        : pointOnSharedWall(hallOutline, roomOutline);
      const drawnStart = {
        x: Number(line.getAttribute("x1")),
        y: Number(line.getAttribute("y1")),
      };
      const drawnEnd = {
        x: Number(line.getAttribute("x2")),
        y: Number(line.getAttribute("y2")),
      };

      const hallIsAnEnd =
        samePoint(drawnStart, hallCenter) || samePoint(drawnEnd, hallCenter);
      const roomCenterIsAnEnd =
        samePoint(drawnStart, roomCenter) || samePoint(drawnEnd, roomCenter);
      const wallIsAnEnd =
        samePoint(drawnStart, wallPoint, WALL_POINT_SLACK_IN_PIXELS) ||
        samePoint(drawnEnd, wallPoint, WALL_POINT_SLACK_IN_PIXELS);
      const drawnWall = samePoint(drawnStart, hallCenter)
        ? drawnEnd
        : drawnStart;

      expect(hallIsAnEnd, `${key} should start at the hall square center`).toBe(
        true,
      );
      expect(
        roomCenterIsAnEnd,
        `${key} should not run to the room center`,
      ).toBe(false);
      expect(
        wallIsAnEnd,
        `${key} should end on the shared wall, near ${wallPoint.x},${wallPoint.y}`,
      ).toBe(true);

      const abyss = abyssPixelsAlong(
        hallCenter,
        drawnWall,
        boxFromPlacement(hallPlacement),
        boxFromPlacement(roomPlacement),
      );
      expect(abyss, `${key} crosses ${abyss} abyss pixels`).toBe(0);
      checked.push(key);
    }

    expect(checked.length > 0).toBe(true);
  });
});
