import type { ConnectionKind } from "./connection.ts";
import type { Level } from "./level.ts";
import type { SpaceKind } from "./space-kind.ts";

export type PlacementShape = "rect" | "circle" | "polygon";

export type OutlinePoint = {
  x: number;
  y: number;
};

type TraceFields = {
  identifier: string;
  x: number;
  y: number;
  width: number;
  height: number;
  printedName?: string;
  shape?: PlacementShape;
  outline?: OutlinePoint[];
  isStart?: boolean;
  isSafe?: boolean;
};

type LevelFreeKind = Exclude<SpaceKind, "room">;

export type TracedSpace =
  | (TraceFields & { kind: "room"; level: Level })
  | {
      [Kind in LevelFreeKind]: TraceFields & { kind: Kind };
    }[LevelFreeKind];

export type TraceTuple = readonly [
  identifier: string,
  level: Level,
  x: number,
  y: number,
  width: number,
  height: number,
];

export type CorridorTraceTuple = readonly [
  identifier: string,
  x: number,
  y: number,
  width: number,
  height: number,
];

export type LinkTuple = readonly [string, string, ConnectionKind];

function isRoomTuple(
  tuple: TraceTuple | CorridorTraceTuple,
): tuple is TraceTuple {
  return tuple.length === 6;
}

export function tuplesToTraces(
  tuples: readonly TraceTuple[],
  kind: "room",
): Extract<TracedSpace, { kind: "room" }>[];
export function tuplesToTraces(
  tuples: readonly CorridorTraceTuple[],
  kind: "corridor",
): Extract<TracedSpace, { kind: "corridor" }>[];
export function tuplesToTraces(
  tuples: readonly (TraceTuple | CorridorTraceTuple)[],
  kind: "room" | "corridor",
): TracedSpace[] {
  if (kind === "room") {
    return tuples.filter(isRoomTuple).map((tuple) => {
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

  return tuples.filter((tuple) => isRoomTuple(tuple) === false).map((tuple) => {
    return {
      identifier: tuple[0],
      kind,
      x: tuple[1],
      y: tuple[2],
      width: tuple[3],
      height: tuple[4],
      shape: "rect",
    };
  });
}
