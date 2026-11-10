import { describe, expect, it } from "vitest";
import { dungeonBoard } from "./board/dungeon-board.ts";
import { dungeonLayout } from "./board/dungeon-layout.ts";
import { findPlacement } from "./board/find-placement.ts";
import { GenerateBoard } from "./generate-board.ts";

const DOOR_TO_WALL_SLACK_IN_PIXELS = 16;

function distanceFromPointToSegment(
  point: { x: number; y: number },
  start: { x: number; y: number },
  end: { x: number; y: number },
): number {
  const spanX = end.x - start.x;
  const spanY = end.y - start.y;
  const spanLengthSquared = spanX * spanX + spanY * spanY;

  if (spanLengthSquared === 0) {
    const dx = point.x - start.x;
    const dy = point.y - start.y;
    return Math.hypot(dx, dy);
  }

  const along =
    ((point.x - start.x) * spanX + (point.y - start.y) * spanY) /
    spanLengthSquared;
  const clamped = Math.max(0, Math.min(1, along));
  const closestX = start.x + clamped * spanX;
  const closestY = start.y + clamped * spanY;

  return Math.hypot(point.x - closestX, point.y - closestY);
}

function distanceFromPointToOutline(
  point: { x: number; y: number },
  outline: readonly { x: number; y: number }[],
): number {
  let best = Number.POSITIVE_INFINITY;

  for (let index = 0; index < outline.length; index += 1) {
    const start = outline[index];
    const end = outline[(index + 1) % outline.length];
    if (start === undefined || end === undefined) {
      continue;
    }

    best = Math.min(best, distanceFromPointToSegment(point, start, end));
  }

  return best;
}

describe("door markers", () => {
  it("sits each ordinary door on or near the room outline's shared wall", () => {
    const svg = new GenerateBoard(dungeonBoard, dungeonLayout).svg();
    const markers = svg.querySelectorAll("[data-door-kind='door']");

    expect(markers.length > 0).toBe(true);

    for (const marker of markers) {
      if ((marker instanceof SVGCircleElement) === false) {
        continue;
      }

      const fromIdentifier = marker.getAttribute("data-from-space-identifier");
      const toIdentifier = marker.getAttribute("data-to-space-identifier");
      expect(fromIdentifier === null).toBe(false);
      expect(toIdentifier === null).toBe(false);
      if (fromIdentifier === null || toIdentifier === null) {
        continue;
      }

      const point = {
        x: marker.cx.baseVal.value,
        y: marker.cy.baseVal.value,
      };

      const outlines = [fromIdentifier, toIdentifier].flatMap((identifier) => {
        const space = dungeonBoard.spaces.find((candidate) => {
          return candidate.identifier === identifier;
        });
        const isEnclosed =
          space?.kind === "room" ||
          space?.kind === "chamber" ||
          space?.kind === "mainGallery";
        const placement = findPlacement(dungeonLayout, identifier);

        if (
          isEnclosed === false ||
          placement === undefined ||
          placement.outline.length < 3
        ) {
          return [];
        }

        return [placement.outline];
      });

      expect(
        outlines.length > 0,
        `door ${fromIdentifier}|${toIdentifier} should join a room or chamber`,
      ).toBe(true);

      const nearest = Math.min(
        ...outlines.map((outline) => distanceFromPointToOutline(point, outline)),
      );

      expect(
        nearest <= DOOR_TO_WALL_SLACK_IN_PIXELS,
        `door ${fromIdentifier}|${toIdentifier} is ${nearest.toFixed(1)}px from the room wall`,
      ).toBe(true);
    }
  });
});
