import type { Board } from "./board.ts";
import { createConnection, type Connection } from "./connection.ts";
import type { Space } from "./space.ts";

export function buildBoard(
  spaces: Space[],
  oneWayConnections: Connection[],
): Board {
  const connections = expandSymmetricConnections(oneWayConnections);

  return {
    spaces,
    connections,
  };
}

function expandSymmetricConnections(connections: Connection[]): Connection[] {
  const expanded: Connection[] = [];

  for (const connection of connections) {
    expanded.push(connection);
    expanded.push(
      createConnection(
        connection.toSpaceIdentifier,
        connection.fromSpaceIdentifier,
        connection.kind,
      ),
    );
  }

  return expanded;
}
