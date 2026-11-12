import type { OverlayDrawnDetail } from "../dungeon-session.ts";
import { EVENT_OVERLAY_DRAWN } from "../dungeon-session.ts";

export class MonsterCardPreviewListener {
  private keysAreBound = false;

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
    this.bindKeysIfNeeded(detail.svg);
  }

  private bindKeysIfNeeded(svg: SVGSVGElement): void {
    if (this.keysAreBound) {
      return;
    }

    this.keysAreBound = true;
    void import("./bind-monster-card-preview.ts").then((module) => {
      module.bindMonsterCardPreview(svg, true);
    });
  }
}
