import type { Board } from "./board/board.ts";
import { findSpace } from "./board/find-space.ts";
import { isUnclearedLevel1Room } from "./board/is-uncleared-level-1-room.ts";
import type { BoardLayout } from "./board/space-placement.ts";
import { MonsterCardOverlay } from "./cards/monster-card-overlay.ts";
import {
  MonsterDeck,
  shuffledLevel1MonsterDeck,
} from "./cards/monster-deck.ts";
import {
  MONSTER_ROOM_ENTERED_EVENT,
  MonsterEncounter,
} from "./cards/monster-encounter.ts";
import { GenerateBoard } from "./rendering/generate-board.ts";
import { GenerateHeroPiece } from "./rendering/generate-hero-piece.ts";
import { GenerateMoveHighlights } from "./rendering/generate-move-highlights.ts";
import { listSpacesAHeroCanMoveTo } from "./movement/list-spaces-a-hero-can-move-to.ts";
import { placePieceOnSpace, type Piece } from "./pieces/piece.ts";
import { SVG_NAMESPACE } from "./rendering/svg-namespace.ts";

export class DungeonSession extends EventTarget {
  private piece: Piece;
  private overlay: SVGGElement | undefined;

  constructor(
    private readonly board: Board,
    private readonly layout: BoardLayout,
    piece: Piece,
    private readonly monsterDeck: MonsterDeck = shuffledLevel1MonsterDeck(),
  ) {
    super();
    this.piece = placePieceOnSpace(piece, piece.spaceIdentifier);
  }

  element(): SVGSVGElement {
    const svg = new GenerateBoard(this.board, this.layout).svg();
    const overlay = document.createElementNS(SVG_NAMESPACE, "g");
    overlay.setAttribute("data-play-overlay", "true");
    svg.append(overlay);
    this.overlay = overlay;
    this.drawOverlay();
    const encounter = new MonsterEncounter(
      this.monsterDeck,
      new MonsterCardOverlay(overlayHost(svg)),
    );
    encounter.bindTo(this);
    if (import.meta.env.DEV) {
      void import("./rendering/bind-reference-overlay.ts").then((module) => {
        module.bindReferenceOverlay(svg, true);
      });
      void import("./cards/bind-monster-card-preview.ts").then((module) => {
        module.bindMonsterCardPreview(svg, true);
      });
    }
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
    this.publishMonsterRoomIfNeeded(spaceIdentifier);
  }

  private publishMonsterRoomIfNeeded(spaceIdentifier: string): void {
    const space = findSpace(this.board, spaceIdentifier);
    if (isUnclearedLevel1Room(space) === false) {
      return;
    }

    this.dispatchEvent(new CustomEvent(MONSTER_ROOM_ENTERED_EVENT));
  }
}

function overlayHost(svg: SVGSVGElement): HTMLElement {
  const app = svg.closest("#app");
  if (app instanceof HTMLElement) {
    return app;
  }

  return svg.parentElement ?? document.body;
}
