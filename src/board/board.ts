import type { Connection } from "./connection";
import type { Doorway } from "./doorway";
import type { Space } from "./space";

export type Board = {
  spaces: Space[];
  doorways: Doorway[];
  connections: Connection[];
};
