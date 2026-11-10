import { createSpace, type Space } from "./space.ts";

const GOLD_LEVEL = 1 as const;

function createGoldRoom(identifier: string): Space {
  return createSpace(identifier, "room", GOLD_LEVEL);
}

function createGoldCorridor(identifier: string): Space {
  return createSpace(identifier, "corridor", GOLD_LEVEL);
}

export const level1Spaces: Space[] = [
  createSpace("main-staircase", "mainStaircase", GOLD_LEVEL, {
    isStart: true,
  }),
  createSpace("main-gallery", "mainGallery", GOLD_LEVEL, {
    isSafe: true,
  }),
  createGoldRoom("level-1-room-northwest"),
  createGoldRoom("level-1-room-north"),
  createGoldRoom("level-1-room-northeast"),
  createGoldRoom("level-1-room-east-northeast"),
  createGoldRoom("level-1-room-east"),
  createGoldRoom("level-1-room-southeast"),
  createGoldRoom("level-1-room-south"),
  createGoldRoom("level-1-room-southwest"),
  createGoldRoom("level-1-room-east-southeast"),
  createGoldCorridor("corridor-north-1"),
  createGoldCorridor("corridor-northeast-1"),
  createGoldCorridor("corridor-east-northeast-1"),
  createGoldCorridor("corridor-east-1"),
  createGoldCorridor("corridor-east-2"),
  createGoldCorridor("corridor-southeast-1"),
  createGoldCorridor("corridor-southeast-2"),
  createGoldCorridor("corridor-south-1"),
  createGoldCorridor("corridor-south-2"),
  createGoldCorridor("corridor-southwest-1"),
  createGoldCorridor("corridor-west-1"),
  createGoldCorridor("corridor-west-2"),
  createGoldCorridor("corridor-east-southeast-1"),
  createSpace("stairs-west", "stairs", GOLD_LEVEL, {
    destinationLevel: 4,
  }),
  createSpace("stairs-southwest", "stairs", GOLD_LEVEL, {
    destinationLevel: 4,
  }),
];
