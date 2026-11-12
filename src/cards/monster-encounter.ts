import { lookupMonsterCard } from "./lookup-monster-card.ts";
import { monsterCombatValues } from "./monster-combat-values.ts";
import {
  MonsterCardOverlay,
  OVERLAY_CLOSED_EVENT,
} from "./monster-card-overlay.ts";
import { MonsterDeck } from "./monster-deck.ts";

export const MONSTER_ROOM_ENTERED_EVENT = "MonsterRoomEntered";
export const MONSTER_CARD_DRAWN_EVENT = "MonsterCardDrawn";

type MonsterCardDrawnDetail = {
  monsterName: string;
};

export class MonsterEncounter extends EventTarget {
  private cardInPlay: string | undefined;

  constructor(
    private readonly deck: MonsterDeck,
    private readonly overlay: MonsterCardOverlay,
  ) {
    super();
    this.addEventListener(MONSTER_CARD_DRAWN_EVENT, (event) => {
      this.showDrawnCard(event);
    });
    overlay.addEventListener(OVERLAY_CLOSED_EVENT, () => {
      this.returnUnfoughtCard();
    });
  }

  bindTo(session: EventTarget): void {
    session.addEventListener(MONSTER_ROOM_ENTERED_EVENT, () => {
      this.takeCardFromDeck();
    });
  }

  private takeCardFromDeck(): void {
    const monsterName = this.deck.takeTopCard();
    if (monsterName === undefined) {
      return;
    }

    this.cardInPlay = monsterName;
    this.dispatchEvent(
      new CustomEvent<MonsterCardDrawnDetail>(MONSTER_CARD_DRAWN_EVENT, {
        detail: { monsterName },
      }),
    );
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

  private returnUnfoughtCard(): void {
    if (this.cardInPlay === undefined) {
      return;
    }

    this.deck.putOnBottom(this.cardInPlay);
    this.cardInPlay = undefined;
  }
}
