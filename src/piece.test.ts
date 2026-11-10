import { describe, expect, it } from "vitest";
import { createPiece, placePieceOnSpace } from "./piece.ts";

describe("piece", () => {
  it("records a kind and the space the piece sits on", () => {
    const piece = createPiece("scarlet", "pawn", "lounge");

    expect(piece.identifier).toBe("scarlet");
    expect(piece.kind).toBe("pawn");
    expect(piece.spaceIdentifier).toBe("lounge");
  });

  it("places a piece on another space without changing who it is", () => {
    const piece = createPiece("hero", "hero", "main-staircase");
    const moved = placePieceOnSpace(piece, "main-gallery");

    expect(moved.identifier).toBe("hero");
    expect(moved.kind).toBe("hero");
    expect(moved.spaceIdentifier).toBe("main-gallery");
    expect(piece.spaceIdentifier).toBe("main-staircase");
  });
});
