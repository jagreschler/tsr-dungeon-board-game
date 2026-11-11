import type { LinkTuple } from "../traced-space.ts";
import { openLinks1 } from "./open-links/board-open-links-1.ts";
import { openLinks2 } from "./open-links/board-open-links-2.ts";
import { openLinks3 } from "./open-links/board-open-links-3.ts";
import { openLinks4 } from "./open-links/board-open-links-4.ts";
import { openLinks5 } from "./open-links/board-open-links-5.ts";
import { secretDoorLinks1 } from "./secret-door-links/board-secret-door-links-1.ts";
import { doorLinks1 } from "./door-links/board-door-links-1.ts";
import { doorLinks2 } from "./door-links/board-door-links-2.ts";

export const dungeonLinkTuples: LinkTuple[] = [
  ...openLinks1,
  ...openLinks2,
  ...openLinks3,
  ...openLinks4,
  ...openLinks5,
  ...secretDoorLinks1,
  ...doorLinks1,
  ...doorLinks2,
];
