import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { dungeonBoard } from "../board/dungeon-board.ts";
import { dungeonLayout } from "../board/dungeon-layout.ts";
import { dungeonLinkTuples } from "../board/map-data/board-links.ts";
import { appendStoredLinkMarks } from "./append-stored-link-marks.ts";
import {
  REFERENCE_BOARD_IMAGE_PATH,
  readReferenceBoardLuminance,
} from "./read-reference-board-luminance.ts";
import { SVG_NAMESPACE } from "../rendering/svg-namespace.ts";

/**
 * No gray crossing is allowlisted. If the print does not show a door
 * clearly, name that pair in the failure and leave it failing.
 */
const doorAndSecretLinksPendingADataFix: readonly [string, string][] = [];

const STROKE_RADIUS_IN_PIXELS = 2.5;
const DASH_ON_IN_PIXELS = 14;
const DASH_OFF_IN_PIXELS = 10;
const ABYSS_LUMINANCE_MIN = 90;
const ABYSS_LUMINANCE_MAX = 205;

function pairKey(left: string, right: string): string {
  return [left, right].sort().join(" ");
}

const pendingDataFixKeys = new Set(
  doorAndSecretLinksPendingADataFix.map((pair) => pairKey(pair[0], pair[1])),
);

const hasReferenceBoard = existsSync(REFERENCE_BOARD_IMAGE_PATH);

describe("stored door marks stop on the shared wall", () => {
  it("lists each pending data-fix pair once, and only stored door links", () => {
    const storedKeys = new Set(
      dungeonLinkTuples
        .filter((tuple) => tuple[2] === "door" || tuple[2] === "secretDoor")
        .map((tuple) => pairKey(tuple[0], tuple[1])),
    );

    expect(doorAndSecretLinksPendingADataFix).toHaveLength(
      pendingDataFixKeys.size,
    );
    expect(pendingDataFixKeys.size).toBe(0);
    for (const key of pendingDataFixKeys) {
      expect(storedKeys.has(key), `${key} should be a stored door or secret`).toBe(
        true,
      );
    }
  });

  it.skipIf(hasReferenceBoard === false)(
    "draws every door and secret stroke on printed stone or ink, never abyss gray",
    () => {
      const board = readReferenceBoardLuminance();
      const parent = document.createElementNS(SVG_NAMESPACE, "g");
      const marks = appendStoredLinkMarks(parent, dungeonBoard, dungeonLayout);
      const lines = [...marks.querySelectorAll("[data-stored-link-mark]")];
      const grayCrossings: string[] = [];
      let checked = 0;

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

        const startX = Number(line.getAttribute("x1"));
        const startY = Number(line.getAttribute("y1"));
        const endX = Number(line.getAttribute("x2"));
        const endY = Number(line.getAttribute("y2"));
        const abyss = countAbyssPixelsOnStroke(
          board,
          startX,
          startY,
          endX,
          endY,
          kind === "secretDoor",
        );
        checked += 1;
        if (abyss > 0) {
          grayCrossings.push(`${key} ${kind} ${abyss}px`);
        }
      }

      expect(checked > 0).toBe(true);
      expect(grayCrossings, grayCrossings.join("\n")).toEqual([]);
    },
  );
});

function countAbyssPixelsOnStroke(
  board: ReturnType<typeof readReferenceBoardLuminance>,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  dashed: boolean,
): number {
  const spanX = endX - startX;
  const spanY = endY - startY;
  const distance = Math.hypot(spanX, spanY);
  const samples = Math.max(Math.ceil(distance), 1);
  const stepX = spanX / samples;
  const stepY = spanY / samples;
  const radiusSquared = STROKE_RADIUS_IN_PIXELS * STROKE_RADIUS_IN_PIXELS + 0.25;
  const seen = new Set<number>();
  let abyss = 0;
  const dashCycle = DASH_ON_IN_PIXELS + DASH_OFF_IN_PIXELS;

  for (let index = 0; index <= samples; index += 1) {
    const along = index * (distance / samples);
    if (dashed && along % dashCycle > DASH_ON_IN_PIXELS) {
      continue;
    }

    const centerX = startX + stepX * index;
    const centerY = startY + stepY * index;
    const pixelX = Math.round(centerX);
    const pixelY = Math.round(centerY);
    const radius = 3;

    for (let offsetY = -radius; offsetY <= radius; offsetY += 1) {
      for (let offsetX = -radius; offsetX <= radius; offsetX += 1) {
        if (offsetX * offsetX + offsetY * offsetY > radiusSquared) {
          continue;
        }

        const x = pixelX + offsetX;
        const y = pixelY + offsetY;
        if (x < 0 || y < 0 || x >= board.width || y >= board.height) {
          continue;
        }

        const pixelIndex = y * board.width + x;
        if (seen.has(pixelIndex)) {
          continue;
        }

        seen.add(pixelIndex);
        const luminance = board.luminance[pixelIndex] ?? 0;
        if (
          luminance >= ABYSS_LUMINANCE_MIN &&
          luminance <= ABYSS_LUMINANCE_MAX
        ) {
          abyss += 1;
        }
      }
    }
  }

  return abyss;
}
