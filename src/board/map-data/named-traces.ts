import type { TracedSpace } from "../traced-space.ts";
import { namedChambersEast } from "./named-chambers-east.ts";
import { namedChambersWest } from "./named-chambers-west.ts";
import { startAndStairs } from "./start-and-stairs.ts";

export const namedTraces: TracedSpace[] = [
  ...namedChambersWest,
  ...namedChambersEast,
  ...startAndStairs,
];
