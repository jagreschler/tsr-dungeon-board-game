import { describe, expect, it } from "vitest";
import { roomTuples1 } from "./board-rooms-1.ts";
import { roomTuples2 } from "./board-rooms-2.ts";
import { roomOutlines } from "./room-outlines.ts";
import type { OutlinePoint } from "./traced-space.ts";

// Pixel size of the rotated Jasper tracing image the outlines were taken from.
const REFERENCE_BOARD_IMAGE_WIDTH = 2200;
const REFERENCE_BOARD_IMAGE_HEIGHT = 1702;
const OUTLINE_BOX_SLACK_IN_PIXELS = 40;

const roomBoxes = [...roomTuples1, ...roomTuples2].map((tuple) => {
  return {
    identifier: tuple[0],
    x: tuple[2],
    y: tuple[3],
    width: tuple[4],
    height: tuple[5],
  };
});

function assertOutlineStaysOnTheBoard(
  name: string,
  outline: OutlinePoint[],
  box: { x: number; y: number; width: number; height: number },
): void {
  expect(outline.length >= 3, `${name} outline has fewer than 3 points`).toBe(
    true,
  );

  for (const point of outline) {
    expect(
      point.x >= 0 && point.x < REFERENCE_BOARD_IMAGE_WIDTH,
      `${name} point x=${point.x} is outside the ${REFERENCE_BOARD_IMAGE_WIDTH}×${REFERENCE_BOARD_IMAGE_HEIGHT} board image`,
    ).toBe(true);
    expect(
      point.y >= 0 && point.y < REFERENCE_BOARD_IMAGE_HEIGHT,
      `${name} point y=${point.y} is outside the ${REFERENCE_BOARD_IMAGE_WIDTH}×${REFERENCE_BOARD_IMAGE_HEIGHT} board image`,
    ).toBe(true);
  }

  const xs = outline.map((point) => point.x);
  const ys = outline.map((point) => point.y);
  const outlineX = Math.min(...xs);
  const outlineY = Math.min(...ys);
  const outlineWidth = Math.max(...xs) - outlineX;
  const outlineHeight = Math.max(...ys) - outlineY;

  expect(
    Math.abs(outlineX - box.x) <= OUTLINE_BOX_SLACK_IN_PIXELS,
    `${name} outline left edge drifted from its traced box`,
  ).toBe(true);
  expect(
    Math.abs(outlineY - box.y) <= OUTLINE_BOX_SLACK_IN_PIXELS,
    `${name} outline top edge drifted from its traced box`,
  ).toBe(true);
  expect(
    Math.abs(outlineWidth - box.width) <= OUTLINE_BOX_SLACK_IN_PIXELS,
    `${name} outline width drifted from its traced box`,
  ).toBe(true);
  expect(
    Math.abs(outlineHeight - box.height) <= OUTLINE_BOX_SLACK_IN_PIXELS,
    `${name} outline height drifted from its traced box`,
  ).toBe(true);
}

describe("room outlines", () => {
  it("has an outline for every numbered room", () => {
    expect(Object.keys(roomOutlines).sort()).toEqual(
      roomBoxes.map((room) => room.identifier).sort(),
    );
  });

  it.each(
    roomBoxes.map((room) => {
      return { identifier: room.identifier };
    }),
  )("$identifier outline matches the reference tracing", ({ identifier }) => {
    expect(roomOutlines[identifier]).toMatchSnapshot();
  });

  it("keeps every room outline on the board image and close to its traced box", () => {
    for (const room of roomBoxes) {
      const outline = roomOutlines[room.identifier];

      expect(
        outline === undefined,
        `${room.identifier} is missing an outline`,
      ).toBe(false);
      if (outline === undefined) {
        continue;
      }

      assertOutlineStaysOnTheBoard(room.identifier, outline, room);
    }
  });
});
