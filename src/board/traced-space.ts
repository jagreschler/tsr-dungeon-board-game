import type { ConnectionKind } from "./connection.ts";
import type { Level } from "./level.ts";
import type { SpaceKind } from "./space-kind.ts";

export type PlacementShape = "rect" | "circle" | "triangle";

export type TriangleTip = "north" | "east" | "south" | "west";

export type TracedSpace = {
  identifier: string;
  kind: SpaceKind;
  level: Level;
  x: number;
  y: number;
  width: number;
  height: number;
  printedName?: string;
  shape?: PlacementShape;
  triangleTip?: TriangleTip;
  isStart?: boolean;
  isSafe?: boolean;
  destinationLevel?: Level;
};

export type TraceTuple = readonly [
  identifier: string,
  level: Level,
  x: number,
  y: number,
  width: number,
  height: number,
];

export type LinkTuple = readonly [string, string, ConnectionKind];

export function tuplesToTraces(
  tuples: readonly TraceTuple[],
  kind: SpaceKind,
): TracedSpace[] {
  return tuples.map((tuple) => {
    return {
      identifier: tuple[0],
      kind,
      level: tuple[1],
      x: tuple[2],
      y: tuple[3],
      width: tuple[4],
      height: tuple[5],
      shape: "rect",
    };
  });
}
