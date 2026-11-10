import type { LinkTuple } from "./traced-space.ts";
import { openLinks1 } from "./board-open-links-1.ts";
import { openLinks2 } from "./board-open-links-2.ts";
import { openLinks3 } from "./board-open-links-3.ts";
import { openLinks4 } from "./board-open-links-4.ts";
import { openLinks5 } from "./board-open-links-5.ts";

export const dungeonLinkTuples: LinkTuple[] = [
  ...openLinks1,
  ...openLinks2,
  ...openLinks3,
  ...openLinks4,
  ...openLinks5,
];
