import type { TracedSpace } from "../../traced-space.ts";

export const startAndStairs: TracedSpace[] = [
  {
    identifier: "main-staircase",
    kind: "mainStaircase",
    level: 1,
    x: 1073,
    y: 740,
    width: 216,
    height: 207,
    printedName: "Main Staircase",
    shape: "circle",
    isStart: true,
  },
  {
    identifier: "main-gallery",
    kind: "mainGallery",
    level: 1,
    x: 1073,
    y: 847,
    width: 216,
    height: 99,
    printedName: "Main Gallery",
    shape: "polygon",
    isSafe: true,
  },
  {
    identifier: "stairs-west",
    kind: "stairs",
    level: 1,
    x: 811,
    y: 741,
    width: 89,
    height: 48,
    shape: "rect",
    destinationLevel: 4,
  },
];
