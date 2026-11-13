import type { Board } from "./board/board.ts";
import { findSpace } from "./board/find-space.ts";
import { isOccupiedLevel1Room } from "./board/is-occupied-level-1-room.ts";
import {
  EVENT_ROOM_ENTERED,
  type RoomEnteredDetail,
} from "./board/room-type.ts";
import type { BoardLayout } from "./board/space-placement.ts";
import { MonsterCardOverlay } from "./cards/monster-card-overlay.ts";
import { MonsterCardDealer } from "./cards/monster-card-dealer.ts";
import { MonsterCardPresenter } from "./cards/monster-card-presenter.ts";
import {
  MonsterDeck,
  shuffledLevel1MonsterDeck,
} from "./cards/monster-deck.ts";
import { GenerateBoard } from "./rendering/generate-board.ts";
import { GenerateHeroPiece } from "./rendering/generate-hero-piece.ts";
import { GenerateMoveHighlights } from "./rendering/generate-move-highlights.ts";
import type { FoundSecretDoor } from "./movement/list-neighbor-spaces-a-hero-can-step-to.ts";
import { listMoveStepCounts } from "./movement/list-spaces-a-hero-can-move-to.ts";
import { placePieceOnSpace, type Piece } from "./pieces/piece.ts";
import { SVG_NAMESPACE } from "./rendering/svg-namespace.ts";

export const EVENT_OVERLAY_DRAWN = "OverlayDrawn";

export type OverlayDrawnDetail = {
  svg: SVGSVGElement;
  overlay: SVGGElement;
  board: Board;
  layout: BoardLayout;
  stepCounts: ReadonlyMap<string, number>;
};

export class DungeonSession extends EventTarget {
  private piece: Piece;
  private overlay: SVGGElement | undefined;

  constructor(
    private readonly board: Board,
    private readonly layout: BoardLayout,
    piece: Piece,
    private readonly monsterDeck: MonsterDeck = shuffledLevel1MonsterDeck(),
    private readonly foundSecretDoors: readonly FoundSecretDoor[] = [],
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
    const cardOverlay = new MonsterCardOverlay(overlayHost(svg));
    const dealer = new MonsterCardDealer(this.monsterDeck);
    const presenter = new MonsterCardPresenter(cardOverlay);
    dealer.listenForRoomEntered(this, "monster");
    dealer.listenForOverlayClosed(cardOverlay);
    presenter.listenForMonsterCardDrawn(dealer);
    return svg;
  }

  private drawOverlay(): void {
    if (this.overlay === undefined) {
      return;
    }

    const stepCounts = listMoveStepCounts(
      this.board,
      this.piece.spaceIdentifier,
      this.foundSecretDoors,
    );
    const highlights = new GenerateMoveHighlights(
      this.board,
      this.layout,
      new Set(stepCounts.keys()),
    ).element();
    highlights.addEventListener("click", (event) => {
      this.onHighlightClick(event);
    });

    this.overlay.replaceChildren(
      highlights,
      new GenerateHeroPiece(this.piece, this.layout).element(),
    );
    this.publishOverlayDrawn(stepCounts);
  }

  private publishOverlayDrawn(
    stepCounts: ReadonlyMap<string, number>,
  ): void {
    if (this.overlay === undefined) {
      return;
    }

    const svg = this.overlay.ownerSVGElement;
    if ((svg instanceof SVGSVGElement) === false) {
      return;
    }

    this.dispatchEvent(
      new CustomEvent<OverlayDrawnDetail>(EVENT_OVERLAY_DRAWN, {
        detail: {
          svg,
          overlay: this.overlay,
          board: this.board,
          layout: this.layout,
          stepCounts,
        },
      }),
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
    if (isOccupiedLevel1Room(space) === false) {
      return;
    }

    this.dispatchEvent(
      new CustomEvent<RoomEnteredDetail>(EVENT_ROOM_ENTERED, {
        detail: { roomType: "monster" },
      }),
    );
  }
}

function overlayHost(svg: SVGSVGElement): HTMLElement {
  const app = svg.closest("#app");
  if (app instanceof HTMLElement) {
    return app;
  }

  return svg.parentElement ?? document.body;
}
