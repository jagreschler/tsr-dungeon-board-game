import type { Level } from "./level.ts";
import type { SpaceKind } from "./space-kind.ts";

export type Space = {
  identifier: string;
  kind: SpaceKind;
  level: Level;
  isStart: boolean;
  isSafe: boolean;
  destinationLevel?: Level;
};

export function createSpace(
  identifier: string,
  kind: SpaceKind,
  level: Level,
  extras: Partial<Pick<Space, "isStart" | "isSafe" | "destinationLevel">> = {},
): Space {
  return {
    identifier,
    kind,
    level,
    isStart: extras.isStart ?? false,
    isSafe: extras.isSafe ?? false,
    destinationLevel: extras.destinationLevel,
  };
}
