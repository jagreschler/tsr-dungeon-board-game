import { describe, expect, it } from "vitest";
import { level1Board } from "./board/level-1-board.ts";
import { level1Layout } from "./board/level-1-layout.ts";
import { GenerateBoard } from "./generate-board.ts";

const ROOM_SELECTOR = ".dungeon-board [data-space-kind='room']";
const CORRIDOR_SELECTOR = ".dungeon-board [data-space-kind='corridor']";
const DOOR_SELECTOR = ".dungeon-board [data-door-kind='door']";
const SECRET_DOOR_SELECTOR = ".dungeon-board [data-door-kind='secretDoor']";

function boardSvg(): SVGSVGElement {
  return new GenerateBoard(level1Board, level1Layout).svg();
}

function uniqueConnectionCount(kind: "door" | "secretDoor"): number {
  const seen = new Set<string>();

  for (const connection of level1Board.connections) {
    if (connection.kind === kind) {
      const ends = [
        connection.fromSpaceIdentifier,
        connection.toSpaceIdentifier,
      ].sort();
      seen.add(ends.join("|"));
    }
  }

  return seen.size;
}

function fillOfFirst(svg: SVGSVGElement, selector: string): string | null {
  const group = svg.querySelector(selector);
  const painted = group?.querySelector("[fill]");
  return painted?.getAttribute("fill") ?? null;
}

function viewBoxBox(svg: SVGSVGElement): {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
} {
  const parts = (svg.getAttribute("viewBox") ?? "").split(" ").map(Number);
  const minX = parts[0] ?? 0;
  const minY = parts[1] ?? 0;
  const width = parts[2] ?? 0;
  const height = parts[3] ?? 0;

  return {
    minX,
    minY,
    maxX: minX + width,
    maxY: minY + height,
  };
}

function shapeIsInsideViewBox(
  element: Element,
  box: { minX: number; minY: number; maxX: number; maxY: number },
): boolean {
  if (element instanceof SVGRectElement) {
    const x = element.x.baseVal.value;
    const y = element.y.baseVal.value;
    const width = element.width.baseVal.value;
    const height = element.height.baseVal.value;
    return (
      x >= box.minX &&
      y >= box.minY &&
      x + width <= box.maxX &&
      y + height <= box.maxY
    );
  }

  if (element instanceof SVGCircleElement) {
    const cx = element.cx.baseVal.value;
    const cy = element.cy.baseVal.value;
    const radius = element.r.baseVal.value;
    return (
      cx - radius >= box.minX &&
      cy - radius >= box.minY &&
      cx + radius <= box.maxX &&
      cy + radius <= box.maxY
    );
  }

  if (element instanceof SVGLineElement) {
    const points = [
      [element.x1.baseVal.value, element.y1.baseVal.value],
      [element.x2.baseVal.value, element.y2.baseVal.value],
    ];
    return points.every((point) => {
      const x = point[0] ?? 0;
      const y = point[1] ?? 0;
      return x >= box.minX && x <= box.maxX && y >= box.minY && y <= box.maxY;
    });
  }

  return true;
}

describe("Level 1 layout", () => {
  it("places every Level 1 space on the grid", () => {
    const placed = new Set(
      level1Layout.placements.map((placement) => placement.spaceIdentifier),
    );

    for (const space of level1Board.spaces) {
      expect(placed.has(space.identifier)).toBe(true);
    }
  });
});

describe("GenerateBoard", () => {
  it("draws one shape group per space", () => {
    const svg = boardSvg();
    const groups = svg.querySelectorAll("[data-space-identifier]");

    expect(groups.length).toBe(level1Board.spaces.length);
  });

  it("draws rooms and corridors with different fills", () => {
    const svg = boardSvg();
    const roomFill = fillOfFirst(svg, ROOM_SELECTOR);
    const corridorFill = fillOfFirst(svg, CORRIDOR_SELECTOR);

    expect(roomFill === null).toBe(false);
    expect(corridorFill === null).toBe(false);
    expect(roomFill === corridorFill).toBe(false);
  });

  it("draws ordinary doors and hides secret doors", () => {
    const svg = boardSvg();
    const doorMarkers = svg.querySelectorAll(DOOR_SELECTOR);
    const secretMarkers = svg.querySelectorAll(SECRET_DOOR_SELECTOR);

    expect(doorMarkers.length).toBe(uniqueConnectionCount("door"));
    expect(secretMarkers.length).toBe(0);
  });

  it("keeps every shape inside the SVG viewBox", () => {
    const svg = boardSvg();
    const box = viewBoxBox(svg);
    const shapes = svg.querySelectorAll("rect, circle, line");

    expect(shapes.length > 0).toBe(true);

    for (const shape of shapes) {
      expect(shapeIsInsideViewBox(shape, box)).toBe(true);
    }
  });
});
