export type Level = 1 | 2 | 3 | 4 | 5 | 6;

export const MINIMUM_LEVEL: Level = 1;
export const MAXIMUM_LEVEL: Level = 6;

export function isLevel(value: number): value is Level {
  const isInRange = value >= MINIMUM_LEVEL && value <= MAXIMUM_LEVEL;
  const isWholeNumber = Number.isInteger(value);

  return isInRange && isWholeNumber;
}
