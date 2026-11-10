import { describe, expect, it } from "vitest";
import { dungeonBoard } from "./board/dungeon-board.ts";
import { findSpace } from "./board/find-space.ts";
import { heroPiece } from "./hero-piece.ts";

describe("hero piece", () => {
  it("starts the Hero on the Main Staircase", () => {
    expect(heroPiece.kind).toBe("hero");
    expect(heroPiece.spaceIdentifier).toBe("main-staircase");

    const space = findSpace(dungeonBoard, heroPiece.spaceIdentifier);
    expect(space === undefined).toBe(false);
    expect(space?.isStart).toBe(true);
    expect(space?.printedName).toBe("Main Staircase");
  });
});
