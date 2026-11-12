import {
  EVENT_ROOM_ENTERED,
  type RoomType,
} from "../board/room-type.ts";
import { EVENT_OVERLAY_CLOSED } from "./monster-card-overlay.ts";
import { MonsterDeck } from "./monster-deck.ts";

export const EVENT_MONSTER_CARD_DRAWN = "MonsterCardDrawn";

type MonsterCardDrawnDetail = {
  monsterName: string;
};

export class MonsterCardDealer extends EventTarget {
  private cardInPlay: string | undefined;

  constructor(private readonly deck: MonsterDeck) {
    super();
  }

  listenForRoomEntered(session: EventTarget, roomType: RoomType): void {
    session.addEventListener(EVENT_ROOM_ENTERED, (event) => {
      if ((event instanceof CustomEvent) === false) {
        return;
      }
      if (event.detail.roomType !== roomType) {
        return;
      }

      this.takeCardFromDeck();
    });
  }

  listenForOverlayClosed(overlay: EventTarget): void {
    overlay.addEventListener(EVENT_OVERLAY_CLOSED, () => {
      this.returnUnfoughtCard();
    });
  }

  private takeCardFromDeck(): void {
    const monsterName = this.deck.takeTopCard();
    if (monsterName === undefined) {
      return;
    }

    this.cardInPlay = monsterName;
    this.dispatchEvent(
      new CustomEvent<MonsterCardDrawnDetail>(EVENT_MONSTER_CARD_DRAWN, {
        detail: { monsterName },
      }),
    );
  }

  private returnUnfoughtCard(): void {
    if (this.cardInPlay === undefined) {
      return;
    }

    this.deck.putOnBottom(this.cardInPlay);
    this.cardInPlay = undefined;
  }
}
