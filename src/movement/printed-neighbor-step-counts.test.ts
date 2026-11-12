import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { dungeonBoard } from "../board/dungeon-board.ts";
import { dungeonLayout } from "../board/dungeon-layout.ts";
import { findPlacement } from "../board/find-placement.ts";
import { boxFromPlacement } from "../board/placement-box.ts";
import {
  REFERENCE_BOARD_IMAGE_PATH,
  readReferenceBoardLuminance,
  type ReferenceBoardLuminance,
} from "../rendering/read-reference-board-luminance.ts";
import { listMoveStepCounts } from "./list-spaces-a-hero-can-move-to.ts";

const hasReferenceBoard = existsSync(REFERENCE_BOARD_IMAGE_PATH);

const ABYSS_LUMINANCE_MIN = 90;
const ABYSS_LUMINANCE_MAX = 205;
const INK_LUMINANCE_MAX = 40;
const STONE_LUMINANCE_MIN = 230;

type Box = { x: number; y: number; width: number; height: number };

type NeighborHow = "openFloor" | "inkWall";

type PrintedNeighbor = {
  left: string;
  right: string;
  leftSteps: number;
  rightSteps: number;
  how: NeighborHow;
  linkKind: string | undefined;
};

function pairKey(left: string, right: string): string {
  return [left, right].sort().join(" ");
}

describe("printed-neighbor step counts", () => {
  it.skipIf(hasReferenceBoard === false)(
    "fails open-floor printed neighbors with equal steps or a jump of 2+, and stored links whose steps are not 1 apart",
    () => {
      const board = readReferenceBoardLuminance();
      const report = listPrintedNeighbors(board);
      const violations = report.neighbors.flatMap((neighbor) => {
        return violationOf(neighbor);
      });
      const walled = report.neighbors
        .filter((neighbor) => neighbor.how === "inkWall")
        .map((neighbor) => {
          const first =
            neighbor.left < neighbor.right
              ? `${neighbor.left} (${neighbor.leftSteps})`
              : `${neighbor.right} (${neighbor.rightSteps})`;
          const second =
            neighbor.left < neighbor.right
              ? `${neighbor.right} (${neighbor.rightSteps})`
              : `${neighbor.left} (${neighbor.leftSteps})`;
          return `${first} / ${second}`;
        })
        .sort();

      expect(violations, violations.join("\n")).toEqual([]);
      expect(walled).toEqual([
        "corridor-1011-741 (3) / corridor-986-786 (2)",
        "corridor-1011-741 (3) / room-northwest (4)",
        "corridor-1018-1011 (3) / corridor-966-968 (4)",
        "corridor-1196-1020 (2) / corridor-1197-970 (1)",
        "corridor-1196-1020 (2) / room-south (2)",
        "corridor-1196-1020 (2) / room-southeast (2)",
        "corridor-1197-970 (1) / room-southeast (2)",
        "corridor-1304-898 (1) / corridor-1358-918 (2)",
        "corridor-1358-918 (2) / corridor-1417-934 (3)",
        "corridor-1417-864 (4) / corridor-1433-817 (5)",
        "corridor-966-968 (4) / room-4-06 (5)",
      ]);
    },
  );
});

function violationOf(neighbor: PrintedNeighbor): string[] {
  const stepGap = Math.abs(neighbor.leftSteps - neighbor.rightSteps);
  const label = `${neighbor.left} (${neighbor.leftSteps}) / ${neighbor.right} (${neighbor.rightSteps}) ${neighbor.how} link=${neighbor.linkKind ?? "none"}`;

  if (neighbor.how === "inkWall") {
    return [];
  }

  const violations: string[] = [];
  if (stepGap === 0 || stepGap >= 2) {
    violations.push(label);
  }

  if (neighbor.linkKind !== undefined && stepGap !== 1) {
    violations.push(label);
  }

  return [...new Set(violations)];
}

function listPrintedNeighbors(board: ReferenceBoardLuminance): {
  neighbors: PrintedNeighbor[];
} {
  const steps = listMoveStepCounts(dungeonBoard, "main-staircase", []);
  const glow = [...steps.entries()].flatMap(([identifier, stepCount]) => {
    const placement = findPlacement(dungeonLayout, identifier);
    if (placement === undefined) {
      return [];
    }

    return [
      {
        identifier,
        stepCount,
        box: boxFromPlacement(placement),
      },
    ];
  });
  const allBoxes = dungeonLayout.placements.map((placement) => {
    return {
      identifier: placement.spaceIdentifier,
      box: boxFromPlacement(placement),
    };
  });
  const links = new Map<string, string>();
  for (const connection of dungeonBoard.connections) {
    links.set(
      pairKey(
        connection.fromSpaceIdentifier,
        connection.toSpaceIdentifier,
      ),
      connection.kind,
    );
  }

  const neighbors: PrintedNeighbor[] = [];
  const seen = new Set<string>();

  for (let leftIndex = 0; leftIndex < glow.length; leftIndex += 1) {
    const left = glow[leftIndex];
    if (left === undefined) {
      continue;
    }

    for (let rightIndex = leftIndex + 1; rightIndex < glow.length; rightIndex += 1) {
      const right = glow[rightIndex];
      if (right === undefined) {
        continue;
      }

      const gap = aabbGap(left.box, right.box);
      if (gap.dx > 16 && gap.dy > 16) {
        continue;
      }

      const key = pairKey(left.identifier, right.identifier);
      if (seen.has(key)) {
        continue;
      }

      seen.add(key);

      if (thirdSpaceInGap(left.box, right.box, gap, allBoxes, key)) {
        continue;
      }

      const how = neighborHow(board, left.box, right.box, gap);
      if (how === undefined) {
        continue;
      }

      neighbors.push({
        left: left.identifier,
        right: right.identifier,
        leftSteps: left.stepCount,
        rightSteps: right.stepCount,
        how,
        linkKind: links.get(key),
      });
    }
  }

  return { neighbors };
}

function aabbGap(
  left: Box,
  right: Box,
): { dx: number; dy: number; ox: number; oy: number } {
  const leftRight = left.x + left.width;
  const leftBottom = left.y + left.height;
  const rightRight = right.x + right.width;
  const rightBottom = right.y + right.height;
  const dx = Math.max(0, left.x - rightRight, right.x - leftRight);
  const dy = Math.max(0, left.y - rightBottom, right.y - leftBottom);
  const ox = Math.min(leftRight, rightRight) - Math.max(left.x, right.x);
  const oy = Math.min(leftBottom, rightBottom) - Math.max(left.y, right.y);
  return { dx, dy, ox, oy };
}

function gapRect(
  left: Box,
  right: Box,
  gap: { dx: number; dy: number },
  width: number,
  height: number,
): { x0: number; y0: number; x1: number; y1: number } {
  const leftRight = left.x + left.width;
  const leftBottom = left.y + left.height;
  const rightRight = right.x + right.width;
  const rightBottom = right.y + right.height;
  let x0: number;
  let y0: number;
  let x1: number;
  let y1: number;

  if (gap.dx > 0) {
    x0 = Math.min(leftRight, rightRight);
    x1 = Math.max(left.x, right.x);
    y0 = Math.max(left.y, right.y);
    y1 = Math.min(leftBottom, rightBottom);
  } else if (gap.dy > 0) {
    y0 = Math.min(leftBottom, rightBottom);
    y1 = Math.max(left.y, right.y);
    x0 = Math.max(left.x, right.x);
    x1 = Math.min(leftRight, rightRight);
  } else {
    x0 = Math.max(left.x, right.x);
    x1 = Math.min(leftRight, rightRight);
    y0 = Math.max(left.y, right.y);
    y1 = Math.min(leftBottom, rightBottom);
  }

  if (x1 < x0) {
    const swap = x0;
    x0 = x1;
    x1 = swap;
  }

  if (y1 < y0) {
    const swap = y0;
    y0 = y1;
    y1 = swap;
  }

  return {
    x0: Math.max(0, Math.floor(x0) - 2),
    y0: Math.max(0, Math.floor(y0) - 2),
    x1: Math.min(width, Math.ceil(x1) + 2),
    y1: Math.min(height, Math.ceil(y1) + 2),
  };
}

function thirdSpaceInGap(
  left: Box,
  right: Box,
  gap: { dx: number; dy: number },
  boxes: readonly { identifier: string; box: Box }[],
  pair: string,
): boolean {
  const names = pair.split(" ");
  const rect = gapRect(left, right, gap, 2200, 1702);
  if (rect.x1 - rect.x0 < 4 && rect.y1 - rect.y0 < 4) {
    return false;
  }

  for (const candidate of boxes) {
    if (names.includes(candidate.identifier)) {
      continue;
    }

    const overlapX =
      Math.min(rect.x1, candidate.box.x + candidate.box.width) -
      Math.max(rect.x0, candidate.box.x);
    const overlapY =
      Math.min(rect.y1, candidate.box.y + candidate.box.height) -
      Math.max(rect.y0, candidate.box.y);
    if (overlapX >= 4 && overlapY >= 4) {
      return true;
    }
  }

  return false;
}

function neighborHow(
  board: ReferenceBoardLuminance,
  left: Box,
  right: Box,
  gap: { dx: number; dy: number; ox: number; oy: number },
): NeighborHow | undefined {
  const shared = (gap.dx <= 3 && gap.oy >= 8) || (gap.dy <= 3 && gap.ox >= 8);
  const near = (gap.dx <= 16 && gap.oy >= 8) || (gap.dy <= 16 && gap.ox >= 8);
  if (shared === false && near === false) {
    return undefined;
  }

  const stats = stripStats(board, left, right, gap);
  const pixels = Math.max(stats.n, 1);
  const abyssFraction = stats.abyss / pixels;
  const inkFraction = stats.ink / pixels;
  const stoneFraction = stats.stone / pixels;

  if (abyssFraction >= 0.45) {
    return undefined;
  }

  if (inkFraction >= 0.28) {
    return "inkWall";
  }

  if (stoneFraction >= 0.28) {
    return "openFloor";
  }

  if (shared) {
    return "openFloor";
  }

  return undefined;
}

function stripStats(
  board: ReferenceBoardLuminance,
  left: Box,
  right: Box,
  gap: { dx: number; dy: number },
): { n: number; abyss: number; ink: number; stone: number } {
  const rect = gapRect(left, right, gap, board.width, board.height);
  if (rect.x1 <= rect.x0 || rect.y1 <= rect.y0) {
    return { n: 0, abyss: 0, ink: 0, stone: 0 };
  }

  let n = 0;
  let abyss = 0;
  let ink = 0;
  let stone = 0;

  for (let y = rect.y0; y < rect.y1; y += 1) {
    const row = y * board.width;
    for (let x = rect.x0; x < rect.x1; x += 1) {
      const luminance = board.luminance[row + x] ?? 0;
      n += 1;
      if (luminance <= INK_LUMINANCE_MAX) {
        ink += 1;
      } else if (luminance >= STONE_LUMINANCE_MIN) {
        stone += 1;
      } else if (
        luminance >= ABYSS_LUMINANCE_MIN &&
        luminance <= ABYSS_LUMINANCE_MAX
      ) {
        abyss += 1;
      }
    }
  }

  return { n, abyss, ink, stone };
}
