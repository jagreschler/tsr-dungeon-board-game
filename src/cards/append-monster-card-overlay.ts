import type {
  MonsterCardAssets,
  MonsterStatsBox,
} from "./lookup-monster-card.ts";
import type { MonsterCombatValues } from "./monster-combat-values.ts";

export function appendMonsterCardOverlay(
  host: HTMLElement,
  assets: MonsterCardAssets,
  combatValues: MonsterCombatValues,
): HTMLElement {
  const overlay = document.createElement("div");
  overlay.setAttribute("data-monster-card-overlay", "true");
  overlay.className = "monster-card-overlay";

  if (assets.clipHref !== undefined) {
    overlay.append(clipStep(assets.clipHref));
  }

  overlay.append(cardStep(assets, combatValues, assets.clipHref !== undefined));
  host.append(overlay);
  return overlay;
}

function clipStep(clipHref: string): HTMLElement {
  const step = document.createElement("div");
  step.setAttribute("data-clip-step", "true");
  step.className = "monster-card-overlay-step";

  const video = document.createElement("video");
  video.src = clipHref;
  video.muted = true;
  video.autoplay = true;
  video.playsInline = true;
  video.setAttribute("muted", "");
  video.setAttribute("playsinline", "");
  video.setAttribute("data-encounter-clip", "true");

  const skip = document.createElement("button");
  skip.type = "button";
  skip.setAttribute("data-skip-clip", "true");
  skip.textContent = "Skip";

  step.append(video, skip);
  void video.play().catch(() => {});
  return step;
}

function cardStep(
  assets: MonsterCardAssets,
  combatValues: MonsterCombatValues,
  startsHidden: boolean,
): HTMLElement {
  const step = document.createElement("div");
  step.setAttribute("data-card-step", "true");
  step.className = "monster-card-overlay-step";
  if (startsHidden) {
    step.setAttribute("hidden", "");
  }

  const card = document.createElement("article");
  card.setAttribute("data-monster-card", "true");
  card.setAttribute("data-card-style", "red");
  card.className = "monster-card";

  if (assets.imageHref === undefined) {
    card.setAttribute("data-plain-card", "true");
    card.append(statsCaption(combatValues, assets.statsBox));
  } else {
    const image = document.createElement("img");
    image.src = assets.imageHref;
    image.alt = combatValues.name;
    card.append(image, statsCaption(combatValues, assets.statsBox));
  }

  const close = document.createElement("button");
  close.type = "button";
  close.setAttribute("data-close-card", "true");
  close.textContent = "Close";

  step.append(card, close);
  return step;
}

function statsCaption(
  combatValues: MonsterCombatValues,
  statsBox: MonsterStatsBox,
): HTMLElement {
  const caption = document.createElement("div");
  const inkClass =
    statsBox.ink === "parchment"
      ? "monster-card-stats-parchment"
      : "monster-card-stats-ink";
  caption.className = `monster-card-stats ${inkClass}`;
  caption.setAttribute("data-monster-card-stats", "true");
  caption.setAttribute("data-stats-box", "true");
  caption.style.top = `${statsBox.topPercent}%`;
  caption.style.height = `${statsBox.heightPercent}%`;

  const name = document.createElement("p");
  name.className = "monster-card-stats-name";
  name.textContent = combatValues.name;

  const columns = document.createElement("div");
  columns.className = "monster-card-stats-columns";
  columns.append(
    valueList([
      `Lightning ${combatValues.lightning}`,
      `Fireball ${combatValues.fireball}`,
    ]),
    valueList([
      `Wizard ${combatValues.wizard}`,
      `Superhero ${combatValues.superhero}`,
      `Hero ${combatValues.hero}`,
      `Elf ${combatValues.elf}`,
    ]),
  );

  caption.append(name, columns);
  return caption;
}

function valueList(lines: string[]): HTMLUListElement {
  const list = document.createElement("ul");
  for (const line of lines) {
    const item = document.createElement("li");
    item.textContent = line;
    list.append(item);
  }
  return list;
}
