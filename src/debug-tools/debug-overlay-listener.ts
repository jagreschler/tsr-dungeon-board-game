import type { OverlayDrawnDetail } from "../dungeon-session.ts";
import { EVENT_OVERLAY_DRAWN } from "../dungeon-session.ts";
import { appendMoveStepLabels } from "./append-move-step-labels.ts";
import { appendStoredLinkMarks } from "./append-stored-link-marks.ts";
import type { DebugMode } from "./debug-mode.ts";

export class DebugOverlayListener {
  private keysAreBound = false;

  constructor(private readonly debugMode: DebugMode) {}

  listenForOverlayDrawn(session: EventTarget): void {
    session.addEventListener(EVENT_OVERLAY_DRAWN, (event) => {
      this.onOverlayDrawn(event);
    });
  }

  private onOverlayDrawn(event: Event): void {
    if ((event instanceof CustomEvent) === false) {
      return;
    }

    const detail = event.detail as OverlayDrawnDetail;
    appendStoredLinkMarks(detail.overlay, detail.board, detail.layout);
    appendMoveStepLabels(detail.overlay, detail.layout, detail.stepCounts);
    this.applyStartingVisibilityIfNeeded(detail.svg);
    this.bindKeysIfNeeded(detail.svg);
  }

  private applyStartingVisibilityIfNeeded(svg: SVGSVGElement): void {
    if (this.keysAreBound) {
      return;
    }

    if (this.debugMode.hasLinks()) {
      svg.setAttribute("data-stored-link-marks-visible", "true");
    }
    if (this.debugMode.hasSteps()) {
      svg.setAttribute("data-move-step-labels-visible", "true");
    }
  }

  private bindKeysIfNeeded(svg: SVGSVGElement): void {
    if (this.keysAreBound) {
      return;
    }

    this.keysAreBound = true;
    void import("./bind-reference-overlay.ts").then((module) => {
      module.bindReferenceOverlay(svg, true);
    });
    void import("./bind-move-step-labels.ts").then((module) => {
      module.bindMoveStepLabels(svg, true);
    });
    void import("./bind-stored-link-marks.ts").then((module) => {
      module.bindStoredLinkMarks(svg, true);
    });
  }
}
