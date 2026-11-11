import { describe, expect, it } from "vitest";
import { createSpace } from "./space.ts";
import { describeSpace } from "./describe-space.ts";

describe("describeSpace", () => {
  it("names a numbered room from its kind and identifier", () => {
    const space = createSpace("room-3-14", "room", 3);

    expect(describeSpace(space)).toBe("Room 3-14, level 3");
  });

  it("uses the printed name when the space has one", () => {
    const space = createSpace("storeroom", "chamber", 3, {
      printedName: "Storeroom",
    });

    expect(describeSpace(space)).toBe("Storeroom, level 3");
  });

  it("names a corridor from its kind and identifier", () => {
    const space = createSpace("corridor-1098-942", "corridor", 1);

    expect(describeSpace(space)).toBe("Corridor 1098-942, level 1");
  });

  it("names the Main Staircase and Main Gallery", () => {
    const staircase = createSpace("main-staircase", "mainStaircase", 1, {
      printedName: "Main Staircase",
    });
    const gallery = createSpace("main-gallery", "mainGallery", 1, {
      printedName: "Main Gallery",
    });

    expect(describeSpace(staircase)).toBe("Main Staircase, level 1");
    expect(describeSpace(gallery)).toBe("Main Gallery, level 1");
  });

  it("names stairs and unnumbered rooms from their identifiers", () => {
    const stairs = createSpace("stairs-west", "stairs", 1);
    const goldRoom = createSpace("room-east-northeast", "room", 1);

    expect(describeSpace(stairs)).toBe("Stairs West, level 1");
    expect(describeSpace(goldRoom)).toBe("Room East Northeast, level 1");
  });
});
