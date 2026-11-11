import { describe, expect, it } from "vitest";
import { dungeonBoard } from "./dungeon-board.ts";
import { listNeighborSpacesAHeroCanStepTo } from "../movement/list-neighbor-spaces-a-hero-can-step-to.ts";
import { listConnectedSpaceIdentifiers } from "../movement/list-connected-space-identifiers.ts";
import { knownUnreachableSpaceIdentifiers } from "./known-unreachable-space-identifiers.ts";

describe("map reachability", () => {
  it("can reach every space from the Main Staircase except the known gaps", () => {
    const reachable = listConnectedSpaceIdentifiers(
      "main-staircase",
      (spaceIdentifier) => {
        return listNeighborSpacesAHeroCanStepTo(
          dungeonBoard,
          spaceIdentifier,
          secretDoorsThePartyHasFound(),
        ).map((space) => space.identifier);
      },
    );

    const unreachable = dungeonBoard.spaces
      .map((space) => space.identifier)
      .filter((identifier) => reachable.has(identifier) === false)
      .sort();

    expect(unreachable).toEqual([...knownUnreachableSpaceIdentifiers].sort());
  });
});

function secretDoorsThePartyHasFound() {
  return dungeonBoard.connections
    .filter((connection) => {
      return connection.kind === "secretDoor";
    })
    .map((connection) => {
      return {
        fromSpaceIdentifier: connection.fromSpaceIdentifier,
        toSpaceIdentifier: connection.toSpaceIdentifier,
      };
    });
}
