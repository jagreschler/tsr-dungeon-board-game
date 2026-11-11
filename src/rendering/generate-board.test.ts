import { describe, expect, it } from "vitest";
import { describeSpace } from "../board/describe-space.ts";
import { dungeonBoard } from "../board/dungeon-board.ts";
import { dungeonLayout } from "../board/dungeon-layout.ts";
import { GenerateBoard } from "./generate-board.ts";

const ROOM_SELECTOR = ".dungeon-board [data-space-kind='room']";
const CORRIDOR_SELECTOR = ".dungeon-board [data-space-kind='corridor']";
const DOOR_SELECTOR = ".dungeon-board [data-door-kind='door']";
const SECRET_DOOR_SELECTOR = ".dungeon-board [data-door-kind='secretDoor']";

const NAMED_CHAMBERS = [
  "Main Gallery",
  "Kitchen",
  "Council Room",
  "Armory",
  "Crypt",
  "Storeroom",
  "Torture Chamber",
  "King's Library",
  "King's Treasure Room",
  "Queen's Treasure Room",
  "Queen's Treasure Room Annex",
  "Wizard's Laboratory",
  "Wizard's Treasure Room",
];

function boardSvg(): SVGSVGElement {
  return new GenerateBoard(dungeonBoard, dungeonLayout).svg();
}

function uniqueConnectionCount(kind: "door" | "secretDoor"): number {
  const seen = new Set<string>();

  for (const connection of dungeonBoard.connections) {
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

  if (element instanceof SVGPolygonElement) {
    const points = element.points;
    for (let index = 0; index < points.numberOfItems; index += 1) {
      const point = points.getItem(index);
      if (
        point.x < box.minX ||
        point.x > box.maxX ||
        point.y < box.minY ||
        point.y > box.maxY
      ) {
        return false;
      }
    }
    return true;
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

describe("board layout", () => {
  it("places every space on the traced board", () => {
    const placed = new Set(
      dungeonLayout.placements.map((placement) => placement.spaceIdentifier),
    );

    for (const space of dungeonBoard.spaces) {
      expect(placed.has(space.identifier)).toBe(true);
    }
  });

  it("gives every room and chamber a polygon outline of at least four points", () => {
    const enclosed = dungeonBoard.spaces.filter((space) => {
      return (
        space.kind === "room" ||
        space.kind === "chamber" ||
        space.kind === "mainGallery"
      );
    });

    for (const space of enclosed) {
      const placement = dungeonLayout.placements.find((candidate) => {
        return candidate.spaceIdentifier === space.identifier;
      });

      expect(placement === undefined).toBe(false);
      expect((placement?.outline.length ?? 0) >= 4).toBe(true);
    }
  });
});

describe("GenerateBoard", () => {
  it("draws one board SVG", () => {
    const svg = boardSvg();

    expect(svg.getAttribute("class")).toBe("dungeon-board");
    expect(svg.getAttribute("aria-label")).toBe("The 1981 Dungeon! board");
    expect(svg.getAttribute("aria-label")?.includes("Level 1")).toBe(false);
  });

  it("draws one shape group per space", () => {
    const svg = boardSvg();
    const groups = svg.querySelectorAll("[data-space-identifier]");

    expect(groups.length).toBe(dungeonBoard.spaces.length);
  });

  it("gives every space a native tooltip with its readable name", () => {
    const svg = boardSvg();

    for (const space of dungeonBoard.spaces) {
      const group = svg.querySelector(
        `[data-space-identifier='${space.identifier}']`,
      );
      const title = group?.querySelector("title");

      expect(title === null || title === undefined).toBe(false);
      expect(title?.textContent).toBe(describeSpace(space));
    }
  });

  it("draws rooms and corridors with different fills", () => {
    const svg = boardSvg();
    const roomFill = fillOfFirst(svg, ROOM_SELECTOR);
    const corridorFill = fillOfFirst(svg, CORRIDOR_SELECTOR);

    expect(roomFill === null).toBe(false);
    expect(corridorFill === null).toBe(false);
    expect(roomFill === corridorFill).toBe(false);
  });

  it("paints rooms with the 1981 level-zone colors", () => {
    const svg = boardSvg();
    const fills = new Set<string>();

    for (const room of svg.querySelectorAll(ROOM_SELECTOR)) {
      const painted = room.querySelector("[fill]");
      const fill = painted?.getAttribute("fill");
      if (fill !== null && fill !== undefined) {
        fills.add(fill);
      }
    }

    expect(fills.size >= 6).toBe(true);
  });

  it("labels each named chamber", () => {
    const svg = boardSvg();
    const labels = [...svg.querySelectorAll("[data-printed-name]")].map(
      (node) => node.getAttribute("data-printed-name"),
    );

    for (const name of NAMED_CHAMBERS) {
      expect(labels.includes(name)).toBe(true);
    }
  });

  it("draws every room and chamber as a polygon of at least four points", () => {
    const svg = boardSvg();
    const groups = svg.querySelectorAll(
      "[data-space-kind='room'], [data-space-kind='chamber'], [data-space-kind='mainGallery']",
    );

    expect(groups.length > 0).toBe(true);

    for (const group of groups) {
      const polygon = group.querySelector("polygon");
      const rect = group.querySelector("rect");
      const circle = group.querySelector("circle");

      expect(polygon === null).toBe(false);
      expect(rect === null).toBe(true);
      expect(circle === null).toBe(true);

      if (polygon instanceof SVGPolygonElement) {
        expect(polygon.points.numberOfItems >= 4).toBe(true);
      }
    }
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
    const shapes = svg.querySelectorAll("rect, circle, line, polygon");

    expect(shapes.length > 0).toBe(true);

    for (const shape of shapes) {
      expect(shapeIsInsideViewBox(shape, box)).toBe(true);
    }
  });
});
