import { describe, expect, it } from "vitest";
import { dungeonBoard } from "../../dungeon-board.ts";
import { dungeonLayout } from "../../dungeon-layout.ts";
import { centerOfBox } from "../../board-grid.ts";
import { findPlacement } from "../../find-placement.ts";
import { boxFromPlacement } from "../../placement-box.ts";
import { findSpace } from "../../find-space.ts";
import { grayGapOpenLinks } from "../open-links/gray-gap-open-links.ts";
import { listConnectedSpaceIdentifiers } from "../../../movement/list-connected-space-identifiers.ts";
import { listNeighborSpacesAHeroCanStepTo } from "../../../movement/list-neighbor-spaces-a-hero-can-step-to.ts";
import { appendStoredLinkMarks } from "../../../debug-tools/append-stored-link-marks.ts";
import { storedDoorMarkInkGaps } from "../../../debug-tools/stored-door-mark-ink-gaps.ts";
import { SVG_NAMESPACE } from "../../../rendering/svg-namespace.ts";

const removedCorridorIdentifiers = [
  "corridor-327-1576",
  "corridor-369-1576",
  "corridor-1433-817",
  "corridor-1433-780",
  "corridor-338-1067",
  "corridor-338-1028",
  "corridor-971-1571",
  "corridor-1001-1571",
  "corridor-1719-635",
  "corridor-1751-635",
  "corridor-2018-558",
  "corridor-2049-558",
  "corridor-1476-598",
  "corridor-1437-598",
  "corridor-1436-640",
  "corridor-1475-640",
  "corridor-1970-1075",
  "corridor-2009-1075",
  "corridor-1443-554",
  "corridor-1455-562",
] as const;

type KeptSquare = {
  identifier: string;
  level: number;
  x: number;
  y: number;
  width: number;
  height: number;
  links: readonly (readonly [string, "open" | "door"])[];
};

const keptSquares: readonly KeptSquare[] = [
  {
    identifier: "corridor-348-1576",
    level: 3,
    x: 306,
    y: 1554,
    width: 84,
    height: 45,
    links: [
      ["corridor-273-1569", "open"],
      ["corridor-410-1573", "open"],
    ],
  },
  {
    identifier: "corridor-1433-799",
    level: 1,
    x: 1412,
    y: 762,
    width: 42,
    height: 74,
    links: [
      ["corridor-1482-762", "open"],
      ["corridor-1417-864", "open"],
    ],
  },
  {
    identifier: "corridor-338-1048",
    level: 3,
    x: 318,
    y: 1009,
    width: 41,
    height: 78,
    links: [
      ["kitchen", "door"],
      ["room-3-10", "door"],
      ["corridor-342-1109", "open"],
    ],
  },
  {
    identifier: "corridor-986-1571",
    level: 4,
    x: 956,
    y: 1554,
    width: 60,
    height: 34,
    links: [
      ["corridor-940-1571", "open"],
      ["corridor-1037-1571", "open"],
    ],
  },
  {
    identifier: "corridor-1735-635",
    level: 6,
    x: 1703,
    y: 617,
    width: 64,
    height: 37,
    links: [
      ["corridor-1799-637", "open"],
      ["corridor-1680-637", "open"],
    ],
  },
  {
    identifier: "corridor-2034-558",
    level: 5,
    x: 2003,
    y: 541,
    width: 62,
    height: 35,
    links: [
      ["corridor-2085-555", "open"],
      ["corridor-1975-559", "open"],
    ],
  },
  {
    identifier: "corridor-1457-598",
    level: 5,
    x: 1418,
    y: 578,
    width: 78,
    height: 41,
    links: [
      ["corridor-1449-562", "open"],
      ["corridor-1456-640", "open"],
    ],
  },
  {
    identifier: "corridor-1456-640",
    level: 1,
    x: 1417,
    y: 618,
    width: 78,
    height: 45,
    links: [
      ["corridor-1457-598", "open"],
      ["corridor-1429-681", "open"],
    ],
  },
  {
    identifier: "corridor-1449-562",
    level: 5,
    x: 1403,
    y: 530,
    width: 93,
    height: 64,
    links: [
      ["corridor-1391-547", "open"],
      ["corridor-1457-598", "open"],
    ],
  },
  {
    identifier: "corridor-1990-1075",
    level: 6,
    x: 1951,
    y: 1056,
    width: 78,
    height: 38,
    links: [
      ["corridor-1918-1074", "open"],
      ["corridor-2035-1086", "open"],
    ],
  },
];

describe("merged duplicate corridor squares", () => {
  it("drops both old markers for each pair", () => {
    const identifiers = new Set(
      dungeonBoard.spaces.map((space) => space.identifier),
    );

    for (const identifier of removedCorridorIdentifiers) {
      expect(identifiers.has(identifier), identifier).toBe(false);
    }
  });

  it.each(keptSquares)(
    "keeps $identifier as one square covering the real space",
    (kept) => {
      const space = findSpace(dungeonBoard, kept.identifier);
      const placement = findPlacement(dungeonLayout, kept.identifier);

      expect(space?.kind).toBe("corridor");
      expect(space?.level).toBe(kept.level);
      expect(placement?.x).toBe(kept.x);
      expect(placement?.y).toBe(kept.y);
      expect(placement?.width).toBe(kept.width);
      expect(placement?.height).toBe(kept.height);
    },
  );

  it("moves every outside link onto the kept square once", () => {
    for (const kept of keptSquares) {
      for (const [neighbor, kind] of kept.links) {
        const matches = connectionsBetween(kept.identifier, neighbor);

        expect(matches, `${kept.identifier} ${neighbor}`).toHaveLength(2);
        expect(new Set(matches.map((connection) => connection.kind))).toEqual(
          new Set([kind]),
        );
      }

      const selfLinks = dungeonBoard.connections.filter((connection) => {
        return (
          connection.fromSpaceIdentifier === kept.identifier &&
          connection.toSpaceIdentifier === kept.identifier
        );
      });

      expect(selfLinks, kept.identifier).toEqual([]);
    }

    expect(
      connectionsBetween("corridor-1449-562", "corridor-1456-640"),
    ).toEqual([]);
  });

  it("does not leave a removed id on a link, a gray-gap ban, or a door mark", () => {
    const removed = new Set<string>(removedCorridorIdentifiers);

    for (const connection of dungeonBoard.connections) {
      expect(removed.has(connection.fromSpaceIdentifier)).toBe(false);
      expect(removed.has(connection.toSpaceIdentifier)).toBe(false);
    }

    for (const link of grayGapOpenLinks) {
      expect(removed.has(link.fromSpaceIdentifier)).toBe(false);
      expect(removed.has(link.toSpaceIdentifier)).toBe(false);
    }

    const grayPairs = grayGapOpenLinks.map((link) => {
      return [link.fromSpaceIdentifier, link.toSpaceIdentifier].sort().join(" ");
    });

    expect(grayPairs).toContain("corridor-1408-754 corridor-1433-799");
    expect(grayPairs).toContain("corridor-1433-799 corridor-1438-716");
    expect(grayPairs).toContain("corridor-1456-640 corridor-1537-637");
    expect(grayPairs).toContain("corridor-1449-562 corridor-1454-489");
    expect(grayPairs).toContain("corridor-1408-491 corridor-1449-562");
    expect(new Set(grayPairs).size).toBe(grayPairs.length);

    for (const key of storedDoorMarkInkGaps.keys()) {
      for (const identifier of removed) {
        expect(key.includes(identifier), key).toBe(false);
      }
    }

    expect(storedDoorMarkInkGaps.has("corridor-338-1048 room-3-10")).toBe(true);
  });

  it("can still reach every space from the Main Staircase", () => {
    const foundSecretDoors = dungeonBoard.connections
      .filter((connection) => connection.kind === "secretDoor")
      .map((connection) => {
        return {
          fromSpaceIdentifier: connection.fromSpaceIdentifier,
          toSpaceIdentifier: connection.toSpaceIdentifier,
        };
      });
    const reachable = listConnectedSpaceIdentifiers(
      "main-staircase",
      (spaceIdentifier) => {
        return listNeighborSpacesAHeroCanStepTo(
          dungeonBoard,
          spaceIdentifier,
          foundSecretDoors,
        ).map((space) => space.identifier);
      },
    );
    const unreachable = dungeonBoard.spaces
      .map((space) => space.identifier)
      .filter((identifier) => reachable.has(identifier) === false);

    expect(unreachable).toEqual([]);
    for (const kept of keptSquares) {
      expect(reachable.has(kept.identifier), kept.identifier).toBe(true);
    }
  });

  it("draws the room-3-10 door from the merged hall square", () => {
    const parent = document.createElementNS(SVG_NAMESPACE, "g");
    const marks = appendStoredLinkMarks(parent, dungeonBoard, dungeonLayout);
    const line = [...marks.querySelectorAll("[data-stored-link-mark]")].find(
      (candidate) => {
        const pair = [
          candidate.getAttribute("data-from-space-identifier"),
          candidate.getAttribute("data-to-space-identifier"),
        ]
          .sort()
          .join(" ");

        return (
          pair === "corridor-338-1048 room-3-10" &&
          candidate.getAttribute("data-link-kind") === "door"
        );
      },
    );

    expect(line === undefined).toBe(false);
    const corridor = findPlacement(dungeonLayout, "corridor-338-1048");
    if (line === undefined || corridor === undefined) {
      return;
    }

    const center = centerOfBox(boxFromPlacement(corridor));
    const points = [
      {
        x: Number(line.getAttribute("x1")),
        y: Number(line.getAttribute("y1")),
      },
      {
        x: Number(line.getAttribute("x2")),
        y: Number(line.getAttribute("y2")),
      },
    ];
    const nearCenter = points.some((point) => {
      return Math.hypot(point.x - center.x, point.y - center.y) < 1;
    });
    const onWestGap = points.some((point) => {
      return Math.hypot(point.x - 318.5, point.y - 1047.5) < 1;
    });

    expect(nearCenter).toBe(true);
    expect(onWestGap).toBe(true);
  });
});

function connectionsBetween(left: string, right: string) {
  const key = [left, right].sort().join(" ");

  return dungeonBoard.connections.filter((connection) => {
    return (
      [connection.fromSpaceIdentifier, connection.toSpaceIdentifier]
        .sort()
        .join(" ") === key
    );
  });
}
