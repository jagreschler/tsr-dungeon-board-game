import { describe, expect, it } from "vitest";
import { chamberOutlines } from "./chamber-outlines.ts";
import { namedChambersEast } from "./named-chambers-east.ts";
import { namedChambersWest } from "./named-chambers-west.ts";
import { startAndStairs } from "./start-and-stairs.ts";
import type { OutlinePoint } from "../traced-space.ts";
import type { TracedSpace } from "../traced-space.ts";

// Pixel size of the rotated Jasper tracing image the outlines were taken from.
const REFERENCE_BOARD_IMAGE_WIDTH = 2200;
const REFERENCE_BOARD_IMAGE_HEIGHT = 1702;
const OUTLINE_BOX_SLACK_IN_PIXELS = 40;

function namedChambers(): TracedSpace[] {
  const gallery = startAndStairs.find((trace) => {
    return trace.identifier === "main-gallery";
  });

  if (gallery === undefined) {
    throw new Error("Main Gallery is missing from the start-and-stairs traces.");
  }

  return [...namedChambersWest, ...namedChambersEast, gallery];
}

function printedNameOf(chamber: TracedSpace): string {
  if (chamber.printedName === undefined) {
    throw new Error(`${chamber.identifier} is missing a printed name.`);
  }

  return chamber.printedName;
}

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

const chambers = namedChambers();

describe("chamber outlines", () => {
  it("has an outline for each of the 13 named chambers", () => {
    expect(chambers.length).toBe(13);
    expect(Object.keys(chamberOutlines).sort()).toEqual(
      chambers.map((chamber) => chamber.identifier).sort(),
    );
  });

  it.each(
    chambers.map((chamber) => {
      return {
        name: printedNameOf(chamber),
        identifier: chamber.identifier,
      };
    }),
  )("$name outline matches the reference tracing", ({ identifier }) => {
    expect(chamberOutlines[identifier]).toMatchSnapshot();
  });

  it("keeps every chamber outline on the board image and close to its traced box", () => {
    for (const chamber of chambers) {
      const name = printedNameOf(chamber);
      const outline = chamberOutlines[chamber.identifier];

      expect(outline === undefined, `${name} is missing an outline`).toBe(
        false,
      );
      if (outline === undefined) {
        continue;
      }

      assertOutlineStaysOnTheBoard(name, outline, chamber);
    }
  });
});
