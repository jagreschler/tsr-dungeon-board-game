import type { Connection } from "./connection.ts";
import type { Space } from "./space.ts";

export type Board = {
  spaces: Space[];
  connections: Connection[];
};
