import { appendMonsterCardOverlay } from "./append-monster-card-overlay.ts";
import type { MonsterCardAssets } from "./lookup-monster-card.ts";
import type { MonsterCombatValues } from "./monster-combat-values.ts";

export const CARD_REVEALED_EVENT = "CardRevealed";
export const OVERLAY_CLOSED_EVENT = "OverlayClosed";

export class MonsterCardOverlay extends EventTarget {
  private hasPublishedCardRevealed = false;

  constructor(private readonly host: HTMLElement) {
    super();
  }

  show(
    assets: MonsterCardAssets,
    combatValues: MonsterCombatValues | undefined,
  ): void {
    if (combatValues === undefined || assets.imageHref === undefined) {
      return;
    }

    this.removeOverlay();
    this.hasPublishedCardRevealed = false;
    const overlay = appendMonsterCardOverlay(this.host, assets, combatValues);
    this.bindOverlay(overlay);

    if (assets.clipHref === undefined) {
      this.publishCardRevealed();
    }
  }

  private bindOverlay(overlay: HTMLElement): void {
    overlay.querySelector("[data-skip-clip]")?.addEventListener("click", () => {
      this.revealCard(overlay);
    });
    overlay.querySelector("video")?.addEventListener("ended", () => {
      this.revealCard(overlay);
    });
    overlay.querySelector("[data-close-card]")?.addEventListener("click", () => {
      this.close();
    });
  }

  private revealCard(overlay: HTMLElement): void {
    const video = overlay.querySelector("video");
    if (video instanceof HTMLVideoElement) {
      video.pause();
    }

    overlay.querySelector("[data-clip-step]")?.setAttribute("hidden", "");
    overlay.querySelector("[data-card-step]")?.removeAttribute("hidden");
    this.publishCardRevealed();
  }

  private publishCardRevealed(): void {
    if (this.hasPublishedCardRevealed) {
      return;
    }

    this.hasPublishedCardRevealed = true;
    this.dispatchEvent(new CustomEvent(CARD_REVEALED_EVENT));
  }

  private close(): void {
    this.removeOverlay();
    this.dispatchEvent(new CustomEvent(OVERLAY_CLOSED_EVENT));
  }

  private removeOverlay(): void {
    this.host.querySelector("[data-monster-card-overlay]")?.remove();
  }
}
