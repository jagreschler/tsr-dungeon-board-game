import type { Board } from "./board/board.ts";
import type { BoardLayout } from "./board/space-placement.ts";
import { GenerateBoard } from "./generate-board.ts";
import { GenerateHeroPiece } from "./generate-hero-piece.ts";
import { GenerateMoveHighlights } from "./generate-move-highlights.ts";
import { listSpacesAHeroCanMoveTo } from "./list-spaces-a-hero-can-move-to.ts";
import { placePieceOnSpace, type Piece } from "./piece.ts";
import { SVG_NAMESPACE } from "./svg-namespace.ts";

export class DungeonSession {
  private piece: Piece;
  private overlay: SVGGElement | undefined;

  constructor(
    private readonly board: Board,
    private readonly layout: BoardLayout,
    piece: Piece,
  ) {
    this.piece = placePieceOnSpace(piece, piece.spaceIdentifier);
  }

  element(): SVGSVGElement {
    const svg = new GenerateBoard(this.board, this.layout).svg();
    const overlay = document.createElementNS(SVG_NAMESPACE, "g");
    overlay.setAttribute("data-play-overlay", "true");
    svg.append(overlay);
    this.overlay = overlay;
    this.drawOverlay();
    return svg;
  }

  private drawOverlay(): void {
    if (this.overlay === undefined) {
      return;
    }

    const reachable = listSpacesAHeroCanMoveTo(
      this.board,
      this.piece.spaceIdentifier,
      [],
    );
    const highlights = new GenerateMoveHighlights(
      this.board,
      this.layout,
      reachable,
    ).element();
    highlights.addEventListener("click", (event) => {
      this.onHighlightClick(event);
    });

    this.overlay.replaceChildren(
      highlights,
      new GenerateHeroPiece(this.piece, this.layout).element(),
    );
  }

  private onHighlightClick(event: Event): void {
    const target = event.target;
    if ((target instanceof Element) === false) {
      return;
    }

    const highlight = target.closest("[data-move-highlight]");
    const spaceIdentifier = highlight?.getAttribute("data-move-highlight");
    if (spaceIdentifier === null || spaceIdentifier === undefined) {
      return;
    }

    this.piece = placePieceOnSpace(this.piece, spaceIdentifier);
    this.drawOverlay();
  }
}
