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
import { appendMoveStepLabels } from "./debug-tools/append-move-step-labels.ts";
import { appendStoredLinkMarks } from "./debug-tools/append-stored-link-marks.ts";
import { DebugMode } from "./debug-tools/debug-mode.ts";
import { GenerateBoard } from "./rendering/generate-board.ts";
import { GenerateHeroPiece } from "./rendering/generate-hero-piece.ts";
import { GenerateMoveHighlights } from "./rendering/generate-move-highlights.ts";
import { listMoveStepCounts } from "./movement/list-spaces-a-hero-can-move-to.ts";
import { placePieceOnSpace, type Piece } from "./pieces/piece.ts";
import { SVG_NAMESPACE } from "./rendering/svg-namespace.ts";

type SessionOptions = {
  debugMode?: DebugMode;
  isLocal?: boolean;
};

export class DungeonSession extends EventTarget {
  private piece: Piece;
  private overlay: SVGGElement | undefined;
  private readonly debugMode: DebugMode;
  private readonly isLocal: boolean;

  constructor(
    private readonly board: Board,
    private readonly layout: BoardLayout,
    piece: Piece,
    private readonly monsterDeck: MonsterDeck = shuffledLevel1MonsterDeck(),
    options: SessionOptions = {},
  ) {
    super();
    this.piece = placePieceOnSpace(piece, piece.spaceIdentifier);
    this.debugMode =
      options.debugMode ?? new DebugMode(window.location.search);
    this.isLocal = options.isLocal ?? import.meta.env.DEV;
  }

  element(): SVGSVGElement {
    const svg = new GenerateBoard(this.board, this.layout).svg();
    const overlay = document.createElementNS(SVG_NAMESPACE, "g");
    overlay.setAttribute("data-play-overlay", "true");
    svg.append(overlay);
    this.overlay = overlay;
    this.drawOverlay();
    if (this.debugMode.hasLinks()) {
      svg.setAttribute("data-stored-link-marks-visible", "true");
    }
    if (this.debugMode.hasSteps()) {
      svg.setAttribute("data-move-step-labels-visible", "true");
    }
    const cardOverlay = new MonsterCardOverlay(overlayHost(svg));
    const dealer = new MonsterCardDealer(this.monsterDeck);
    const presenter = new MonsterCardPresenter(cardOverlay);
    dealer.listenForRoomEntered(this, "monster");
    dealer.listenForOverlayClosed(cardOverlay);
    presenter.listenForMonsterCardDrawn(dealer);
    if (this.mapDebugIsOn()) {
      void import("./debug-tools/bind-reference-overlay.ts").then((module) => {
        module.bindReferenceOverlay(svg, true);
      });
      void import("./debug-tools/bind-move-step-labels.ts").then((module) => {
        module.bindMoveStepLabels(svg, true);
      });
      void import("./debug-tools/bind-stored-link-marks.ts").then((module) => {
        module.bindStoredLinkMarks(svg, true);
      });
    }
    if (this.isLocal) {
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

    const stepCounts = listMoveStepCounts(
      this.board,
      this.piece.spaceIdentifier,
      [],
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
    if (this.mapDebugIsOn()) {
      appendStoredLinkMarks(this.overlay, this.board, this.layout);
      appendMoveStepLabels(this.overlay, this.layout, stepCounts);
    }
  }

  private mapDebugIsOn(): boolean {
    return this.isLocal || this.debugMode.isOn();
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
