import { describe, expect, it } from "vitest";
import { createRoom, createSpace } from "./space.ts";
import { describeSpace } from "./describe-space.ts";

describe("describeSpace", () => {
  it("names a numbered room from its kind and identifier", () => {
    const space = createRoom("room-level-03-orange-14", 3);

    expect(describeSpace(space)).toBe("Room Level 03 Orange 14, level 3");
  });

  it("uses the printed name when the space has one", () => {
    const space = createSpace("storeroom", "chamber", {
      printedName: "Storeroom",
    });

    expect(describeSpace(space)).toBe("Storeroom");
  });

  it("names a corridor from its kind and identifier", () => {
    const space = createSpace("corridor-1098-942", "corridor");

    expect(describeSpace(space)).toBe("Corridor 1098-942");
  });

  it("names the Main Staircase", () => {
    const staircase = createSpace("main-staircase", "mainStaircase", {
      printedName: "Main Staircase",
    });

    expect(describeSpace(staircase)).toBe("Main Staircase");
  });

  it("names a colored room from its level and color words", () => {
    const goldRoom = createRoom("room-level-01-caramel-02", 1);

    expect(describeSpace(goldRoom)).toBe("Room Level 01 Caramel 02, level 1");
  });
});
