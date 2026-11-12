import { lookupMonsterCard } from "./lookup-monster-card.ts";
import { monsterCombatValues } from "./monster-combat-values.ts";
import { MonsterCardOverlay } from "./monster-card-overlay.ts";
import { EVENT_MONSTER_CARD_DRAWN } from "./monster-card-dealer.ts";

export class MonsterCardPresenter {
  constructor(private readonly overlay: MonsterCardOverlay) {}

  listenForMonsterCardDrawn(dealer: EventTarget): void {
    dealer.addEventListener(EVENT_MONSTER_CARD_DRAWN, (event) => {
      this.showDrawnCard(event);
    });
  }

  private showDrawnCard(event: Event): void {
    if ((event instanceof CustomEvent) === false) {
      return;
    }

    const monsterName = event.detail.monsterName;
    if (typeof monsterName !== "string") {
      return;
    }

    const assets = lookupMonsterCard(1, monsterName);
    const combatValues = monsterCombatValues(monsterName);
    this.overlay.show(assets, combatValues);
  }
}
