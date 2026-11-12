import type { Space } from "./space.ts";

export function isUnclearedLevel1Room(
  space: Space | undefined,
): boolean {
  if (space === undefined) {
    return false;
  }

  return space.kind === "room" && space.level === 1;
}
