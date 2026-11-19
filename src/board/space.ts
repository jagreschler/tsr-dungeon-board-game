import type { Level } from "./level.ts";
import type { SpaceKind } from "./space-kind.ts";

type SpaceFields = {
  identifier: string;
  isStart: boolean;
  isSafe: boolean;
  printedName?: string;
};

export type RoomSpace = SpaceFields & {
  kind: "room";
  level: Level;
};

type LevelFreeKind = Exclude<SpaceKind, "room">;

export type LevelFreeSpace = {
  [Kind in LevelFreeKind]: SpaceFields & { kind: Kind };
}[LevelFreeKind];

export type Space = RoomSpace | LevelFreeSpace;

type SpaceExtras = Partial<
  Pick<SpaceFields, "isStart" | "isSafe" | "printedName">
>;

function spaceFields(identifier: string, extras: SpaceExtras): SpaceFields {
  return {
    identifier,
    isStart: extras.isStart ?? false,
    isSafe: extras.isSafe ?? false,
    printedName: extras.printedName,
  };
}

export function createRoom(
  identifier: string,
  level: Level,
  extras: SpaceExtras = {},
): RoomSpace {
  return {
    ...spaceFields(identifier, extras),
    kind: "room",
    level,
  };
}

export function createSpace<Kind extends LevelFreeKind>(
  identifier: string,
  kind: Kind,
  extras: SpaceExtras = {},
): SpaceFields & { kind: Kind } {
  return {
    ...spaceFields(identifier, extras),
    kind,
  };
}
