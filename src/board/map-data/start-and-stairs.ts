import type { TracedSpace } from "../traced-space.ts";

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
    x: 812,
    y: 683,
    width: 112,
    height: 106,
    shape: "rect",
    destinationLevel: 4,
  },
];
