import { applySpaceOutline } from "./apply-space-outline.ts";
import type { TraceTuple, TracedSpace } from "./traced-space.ts";
import { tuplesToTraces } from "./traced-space.ts";
import { namedTraces } from "./named-traces.ts";
import { roomTuples1 } from "./board-rooms-1.ts";
import { roomTuples2 } from "./board-rooms-2.ts";
import { corridorTuples1 } from "./board-corridors-1.ts";
import { corridorTuples2 } from "./board-corridors-2.ts";
import { corridorTuples3 } from "./board-corridors-3.ts";
import { corridorTuples4 } from "./board-corridors-4.ts";

const roomTuples: TraceTuple[] = [
  ...roomTuples1,
  ...roomTuples2,
];

const corridorTuples: TraceTuple[] = [
  ...corridorTuples1,
  ...corridorTuples2,
  ...corridorTuples3,
  ...corridorTuples4,
];

export const dungeonTraces: TracedSpace[] = [
  ...namedTraces,
  ...tuplesToTraces(roomTuples, "room"),
  ...tuplesToTraces(corridorTuples, "corridor"),
].map(applySpaceOutline);
