export type SpaceReachabilityRules = {
  neighborsOf: (spaceIdentifier: string) => readonly string[];
  isBlocked?: (spaceIdentifier: string) => boolean;
  isStoppingSpace?: (spaceIdentifier: string) => boolean;
};

export function listReachableSpaceIdentifiers(
  startSpaceIdentifier: string,
  maximumStepCount: number,
  rules: SpaceReachabilityRules,
): Set<string> {
  const reachable = new Set<string>();
  const visited = new Set<string>([startSpaceIdentifier]);
  const queue: { spaceIdentifier: string; steps: number }[] = [
    { spaceIdentifier: startSpaceIdentifier, steps: 0 },
  ];

  while (queue.length > 0) {
    const current = queue.shift();
    if (current === undefined || current.steps >= maximumStepCount) {
      continue;
    }

    for (const neighborIdentifier of rules.neighborsOf(
      current.spaceIdentifier,
    )) {
      if (visited.has(neighborIdentifier)) {
        continue;
      }

      if (
        rules.isBlocked !== undefined &&
        rules.isBlocked(neighborIdentifier) === true
      ) {
        continue;
      }

      visited.add(neighborIdentifier);
      reachable.add(neighborIdentifier);

      if (
        rules.isStoppingSpace !== undefined &&
        rules.isStoppingSpace(neighborIdentifier) === true
      ) {
        continue;
      }

      queue.push({
        spaceIdentifier: neighborIdentifier,
        steps: current.steps + 1,
      });
    }
  }

  return reachable;
}
