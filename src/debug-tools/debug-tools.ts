import {
  EVENT_BOARD_DRAWING,
  EVENT_BOARD_DRAWN,
  type BoardDrawnDetail,
} from "../board-events.ts";
import { MonsterCardPreviewListener } from "../cards/monster-card-preview-listener.ts";
import type { DebugMode } from "./debug-mode.ts";
import { DebugOverlayListener } from "./debug-overlay-listener.ts";
import { ReferenceImagePicker } from "./reference-image-picker.ts";

export class DebugTools {
  constructor(private readonly debugMode: DebugMode) {}

  listen(session: EventTarget): void {
    session.addEventListener(
      EVENT_BOARD_DRAWING,
      () => {
        new DebugOverlayListener(this.debugMode).listenForOverlayDrawn(session);
        new MonsterCardPreviewListener().listenForOverlayDrawn(session);
      },
      { once: true },
    );
    session.addEventListener(EVENT_BOARD_DRAWN, (event) => {
      this.placePicker(event);
    });
  }

  private placePicker(event: Event): void {
    if ((event instanceof CustomEvent) === false) {
      return;
    }

    const detail = event.detail as BoardDrawnDetail;
    new ReferenceImagePicker(detail.svg).place();
  }
}
