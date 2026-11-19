import { describe, expect, it } from "vitest";
import { buildBoard } from "../board/build-board.ts";
import { createConnection } from "../board/connection.ts";
import { createRoom, createSpace } from "../board/space.ts";
import { everySecretDoor } from "./every-secret-door.ts";

describe("every secret door", () => {
  it("returns one entry per secret door connection", () => {
    const board = buildBoard(
      [
        createSpace("hall", "corridor"),
        createSpace("nook", "corridor"),
        createRoom("room", 1),
      ],
      [
        createConnection("hall", "nook", "secretDoor"),
        createConnection("hall", "room", "door"),
      ],
    );

    expect(everySecretDoor(board)).toEqual([
      {
        fromSpaceIdentifier: "hall",
        toSpaceIdentifier: "nook",
      },
      {
        fromSpaceIdentifier: "nook",
        toSpaceIdentifier: "hall",
      },
    ]);
  });
});
