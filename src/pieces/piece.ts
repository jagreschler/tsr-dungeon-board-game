export type Piece = {
  identifier: string;
  kind: string;
  spaceIdentifier: string;
};

export function createPiece(
  identifier: string,
  kind: string,
  spaceIdentifier: string,
): Piece {
  return {
    identifier,
    kind,
    spaceIdentifier,
  };
}

export function placePieceOnSpace(
  piece: Piece,
  spaceIdentifier: string,
): Piece {
  return createPiece(piece.identifier, piece.kind, spaceIdentifier);
}
