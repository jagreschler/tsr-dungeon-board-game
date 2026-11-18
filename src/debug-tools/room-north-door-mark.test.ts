import { describe, expect, it } from "vitest";
import { dungeonBoard } from "../board/dungeon-board.ts";
import { dungeonLayout } from "../board/dungeon-layout.ts";
import { findPlacement } from "../board/find-placement.ts";
import { centerOfBox } from "../board/board-grid.ts";
import { boxFromPlacement } from "../board/placement-box.ts";
import { appendStoredLinkMarks } from "./append-stored-link-marks.ts";
import { storedDoorMarkInkGaps } from "./stored-door-mark-ink-gaps.ts";
import { SVG_NAMESPACE } from "../rendering/svg-namespace.ts";

describe("room-north door mark", () => {
  it("draws the door on the south wall of corridor-1118-486", () => {
    const parent = document.createElementNS(SVG_NAMESPACE, "g");
    const marks = appendStoredLinkMarks(parent, dungeonBoard, dungeonLayout);
    const line = [...marks.querySelectorAll("[data-stored-link-mark]")].find(
      (candidate) => {
        const pair = [
          candidate.getAttribute("data-from-space-identifier"),
          candidate.getAttribute("data-to-space-identifier"),
        ]
          .sort()
          .join(" ");

        return (
          pair === "corridor-1118-486 room-north" &&
          candidate.getAttribute("data-link-kind") === "door"
        );
      },
    );

    expect(line === undefined).toBe(false);
    expect(
      storedDoorMarkInkGaps.has("corridor-1068-485 room-north"),
    ).toBe(false);
    expect(
      storedDoorMarkInkGaps.has("corridor-1118-486 room-north"),
    ).toBe(true);

    const corridor = findPlacement(dungeonLayout, "corridor-1118-486");
    expect(corridor === undefined).toBe(false);
    if (line === undefined || corridor === undefined) {
      return;
    }

    const box = boxFromPlacement(corridor);
    const center = centerOfBox(box);
    const points = [
      {
        x: Number(line.getAttribute("x1")),
        y: Number(line.getAttribute("y1")),
      },
      {
        x: Number(line.getAttribute("x2")),
        y: Number(line.getAttribute("y2")),
      },
    ];
    const nearCenter = points.some((point) => {
      return Math.hypot(point.x - center.x, point.y - center.y) < 4;
    });
    const onSouthWall = points.some((point) => {
      const insideX = point.x > box.x && point.x < box.x + box.width;
      const onSouthEdge = Math.abs(point.y - (box.y + box.height)) <= 2;

      return insideX && onSouthEdge;
    });
    const onOldSquare = points.some((point) => {
      return Math.hypot(point.x - 1068.5, point.y - 485) < 20;
    });

    expect(nearCenter).toBe(true);
    expect(onSouthWall).toBe(true);
    expect(onOldSquare).toBe(false);
  });
});
