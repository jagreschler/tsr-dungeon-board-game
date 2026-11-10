import type { Level } from "./level.ts";
import type { SpaceKind } from "./space-kind.ts";

export type Space = {
  identifier: string;
  kind: SpaceKind;
  level: Level;
  isStart: boolean;
  isSafe: boolean;
  printedName?: string;
  destinationLevel?: Level;
};

export function createSpace(
  identifier: string,
  kind: SpaceKind,
  level: Level,
  extras: Partial<
    Pick<Space, "isStart" | "isSafe" | "destinationLevel" | "printedName">
  > = {},
): Space {
  return {
    identifier,
    kind,
    level,
    isStart: extras.isStart ?? false,
    isSafe: extras.isSafe ?? false,
    printedName: extras.printedName,
    destinationLevel: extras.destinationLevel,
  };
}
