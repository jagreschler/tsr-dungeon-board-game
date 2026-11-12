export type RoomType = "monster" | "chamber";

export const EVENT_ROOM_ENTERED = "RoomEntered";

export type RoomEnteredDetail = {
  roomType: RoomType;
};
