import { describe, expect, it } from "vitest";
import { createPiece } from "./piece.ts";

describe("piece", () => {
  it("records a kind and the space the piece sits on", () => {
    const piece = createPiece("scarlet", "pawn", "lounge");

    expect(piece.identifier).toBe("scarlet");
    expect(piece.kind).toBe("pawn");
    expect(piece.spaceIdentifier).toBe("lounge");
  });
});
