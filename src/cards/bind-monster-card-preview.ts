import { lookupMonsterCard } from "./lookup-monster-card.ts";
import { monsterCombatValues } from "./monster-combat-values.ts";
import { MonsterCardOverlay } from "./monster-card-overlay.ts";

export function bindMonsterCardPreview(
  svg: SVGSVGElement,
  isLocal: boolean,
): () => void {
  if (isLocal === false) {
    return () => {};
  }

  const host = overlayHost(svg);
  const overlay = new MonsterCardOverlay(host);

  const onKeyDown = (event: KeyboardEvent) => {
    showPreviewIfNeeded(overlay, host, event);
  };

  window.addEventListener("keydown", onKeyDown);
  return () => {
    window.removeEventListener("keydown", onKeyDown);
  };
}

function overlayHost(svg: SVGSVGElement): HTMLElement {
  const app = svg.closest("#app");
  if (app instanceof HTMLElement) {
    return app;
  }

  return svg.parentElement ?? document.body;
}

function showPreviewIfNeeded(
  overlay: MonsterCardOverlay,
  host: HTMLElement,
  event: KeyboardEvent,
): void {
  const monsterName = monsterNameForPreviewKey(event);
  if (event.repeat || monsterName === undefined) {
    return;
  }

  if (host.querySelector("[data-monster-card-overlay]") !== null) {
    return;
  }

  const assets = lookupMonsterCard(1, monsterName);
  const combatValues = monsterCombatValues(monsterName);
  if (event.shiftKey) {
    overlay.show({ ...assets, clipHref: undefined }, combatValues);
    return;
  }

  overlay.show(assets, combatValues);
}

function monsterNameForPreviewKey(event: KeyboardEvent): string | undefined {
  if (
    event.ctrlKey === false &&
    event.metaKey === false &&
    event.altKey === false
  ) {
    const key = event.key.toLowerCase();
    if (key === "g") {
      return "Goblins";
    }
    if (key === "h") {
      return "Hobgoblins";
    }
    if (key === "l" && event.shiftKey) {
      return "Giant Lizard";
    }
    if (key === "r") {
      return "Giant Rats";
    }
  }

  return undefined;
}
