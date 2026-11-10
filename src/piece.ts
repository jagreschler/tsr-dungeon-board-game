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
