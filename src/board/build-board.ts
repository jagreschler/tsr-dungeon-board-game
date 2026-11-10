import type { Board } from "./board";
import { createConnection, type Connection } from "./connection";
import type { Doorway } from "./doorway";
import type { Space } from "./space";

export function buildBoard(
  spaces: Space[],
  doorways: Doorway[],
  oneWayConnections: Connection[],
): Board {
  const connections = expandSymmetricConnections(oneWayConnections);

  return {
    spaces,
    doorways,
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
      ),
    );
  }

  return expanded;
}
