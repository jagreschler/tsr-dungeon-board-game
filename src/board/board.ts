import type { Connection } from "./connection.ts";
import type { Doorway } from "./doorway.ts";
import type { Space } from "./space.ts";

export type Board = {
  spaces: Space[];
  doorways: Doorway[];
  connections: Connection[];
};
