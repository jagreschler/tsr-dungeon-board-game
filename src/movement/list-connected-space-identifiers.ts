import { listReachableSpaceIdentifiers } from "./list-reachable-space-identifiers.ts";

export function listConnectedSpaceIdentifiers(
  startSpaceIdentifier: string,
  neighborsOf: (spaceIdentifier: string) => readonly string[],
): Set<string> {
  const connected = listReachableSpaceIdentifiers(
    startSpaceIdentifier,
    Number.MAX_SAFE_INTEGER,
    { neighborsOf },
  );
  connected.add(startSpaceIdentifier);
  return connected;
}
