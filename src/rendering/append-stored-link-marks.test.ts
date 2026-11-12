import { describe, expect, it } from "vitest";
import { dungeonBoard } from "../board/dungeon-board.ts";
import { dungeonLayout } from "../board/dungeon-layout.ts";
import { dungeonLinkTuples } from "../board/map-data/board-links.ts";
import { centerOfBox } from "../board/board-grid.ts";
import { boxFromPlacement } from "../board/placement-box.ts";
import { findPlacement } from "../board/find-placement.ts";
import { appendStoredLinkMarks } from "./append-stored-link-marks.ts";
import { SVG_NAMESPACE } from "./svg-namespace.ts";

function pairKey(left: string, right: string, kind: string): string {
  return `${[left, right].sort().join(" ")} ${kind}`;
}

describe("appendStoredLinkMarks", () => {
  it("draws exactly one line per stored link, with the right kind", () => {
    const parent = document.createElementNS(SVG_NAMESPACE, "g");
    const marks = appendStoredLinkMarks(parent, dungeonBoard, dungeonLayout);
    const lines = [...marks.querySelectorAll("[data-stored-link-mark]")];

    const storedKeys = dungeonLinkTuples.map((tuple) => {
      return pairKey(tuple[0], tuple[1], tuple[2]);
    });
    const drawnKeys = lines.map((line) => {
      return pairKey(
        line.getAttribute("data-from-space-identifier") ?? "",
        line.getAttribute("data-to-space-identifier") ?? "",
        line.getAttribute("data-link-kind") ?? "",
      );
    });

    expect(marks.getAttribute("data-stored-link-marks")).toBe("true");
    expect(marks.getAttribute("pointer-events")).toBe("none");
    expect(new Set(storedKeys).size).toBe(dungeonLinkTuples.length);
    expect(lines).toHaveLength(dungeonLinkTuples.length);
    expect(drawnKeys.sort()).toEqual([...storedKeys].sort());

    const open = marks.querySelector(
      "[data-stored-link-mark][data-link-kind='open'][data-from-space-identifier='main-staircase'][data-to-space-identifier='corridor-1098-942']",
    );
    const door = marks.querySelector(
      "[data-stored-link-mark][data-link-kind='door']",
    );
    const secret = marks.querySelector(
      "[data-stored-link-mark][data-link-kind='secretDoor'][data-from-space-identifier='room-east'][data-to-space-identifier='corridor-1417-864']",
    );
    const staircase = findPlacement(dungeonLayout, "main-staircase");
    const hall = findPlacement(dungeonLayout, "corridor-1098-942");
    const from = centerOfBox(boxFromPlacement(staircase!));
    const to = centerOfBox(boxFromPlacement(hall!));

    expect(open?.tagName).toBe("line");
    expect(open?.getAttribute("x1")).toBe(String(from.x));
    expect(open?.getAttribute("y1")).toBe(String(from.y));
    expect(open?.getAttribute("x2")).toBe(String(to.x));
    expect(open?.getAttribute("y2")).toBe(String(to.y));
    expect(door?.tagName).toBe("line");
    expect(secret?.tagName).toBe("line");
    expect(
      lines.filter((line) => line.getAttribute("data-link-kind") === "open")
        .length > 0,
    ).toBe(true);
    expect(
      lines.filter((line) => line.getAttribute("data-link-kind") === "door")
        .length > 0,
    ).toBe(true);
    expect(
      lines.filter(
        (line) => line.getAttribute("data-link-kind") === "secretDoor",
      ).length > 0,
    ).toBe(true);
  });
});
