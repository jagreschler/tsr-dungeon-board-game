import { describe, expect, it } from "vitest";
import {
  EVENT_ROOM_ENTERED,
  type RoomEnteredDetail,
  type RoomType,
} from "../board/room-type.ts";
import { EVENT_OVERLAY_CLOSED } from "./monster-card-overlay.ts";
import { MonsterDeck } from "./monster-deck.ts";
import {
  EVENT_MONSTER_CARD_DRAWN,
  MonsterCardStock,
} from "./monster-card-stock.ts";

function enterRoom(session: EventTarget, roomType: RoomType): void {
  session.dispatchEvent(
    new CustomEvent<RoomEnteredDetail>(EVENT_ROOM_ENTERED, {
      detail: { roomType },
    }),
  );
}

describe("MonsterCardStock", () => {
  it("names the room-entered event RoomEntered", () => {
    expect(EVENT_ROOM_ENTERED).toBe("RoomEntered");
  });

  it("draws the top card after a matching RoomEntered", () => {
    const deck = new MonsterDeck(["Skeleton", "Goblins"]);
    const stock = new MonsterCardStock(deck);
    const session = new EventTarget();
    const drawn: string[] = [];
    stock.listenForRoomEntered(session, "monster");
    stock.addEventListener(EVENT_MONSTER_CARD_DRAWN, (event) => {
      if (event instanceof CustomEvent) {
        drawn.push(event.detail.monsterName);
      }
    });

    enterRoom(session, "monster");

    expect(drawn).toEqual(["Skeleton"]);
  });

  it("does not draw when the room type does not match", () => {
    const deck = new MonsterDeck(["Skeleton", "Goblins"]);
    const stock = new MonsterCardStock(deck);
    const session = new EventTarget();
    const drawn: string[] = [];
    stock.listenForRoomEntered(session, "monster");
    stock.addEventListener(EVENT_MONSTER_CARD_DRAWN, (event) => {
      if (event instanceof CustomEvent) {
        drawn.push(event.detail.monsterName);
      }
    });

    enterRoom(session, "chamber");

    expect(drawn).toEqual([]);
    expect(deck.takeTopCard()).toBe("Skeleton");
  });

  it("puts the unfought card on the bottom when the overlay closes", () => {
    const deck = new MonsterDeck(["Skeleton", "Goblins"]);
    const stock = new MonsterCardStock(deck);
    const session = new EventTarget();
    const overlay = new EventTarget();
    stock.listenForRoomEntered(session, "monster");
    stock.listenForOverlayClosed(overlay);

    enterRoom(session, "monster");
    overlay.dispatchEvent(new CustomEvent(EVENT_OVERLAY_CLOSED));

    expect(deck.takeTopCard()).toBe("Goblins");
    expect(deck.takeTopCard()).toBe("Skeleton");
  });
});
