import { roomTuples1 } from "./board-rooms-1.ts";
import { roomTuples2 } from "./board-rooms-2.ts";
import { namedTraces } from "./named-traces.ts";
import type { TraceTuple, TracedSpace } from "./traced-space.ts";
import { tuplesToTraces } from "./traced-space.ts";

const roomTuples: TraceTuple[] = [
  ...roomTuples1,
  ...roomTuples2,
];

export const dungeonTraces: TracedSpace[] = [
  ...namedTraces,
  ...tuplesToTraces(roomTuples, "room"),
];
