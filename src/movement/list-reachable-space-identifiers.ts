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
  return new Set(
    listReachableSpaceStepCounts(
      startSpaceIdentifier,
      maximumStepCount,
      rules,
    ).keys(),
  );
}

export function listReachableSpaceStepCounts(
  startSpaceIdentifier: string,
  maximumStepCount: number,
  rules: SpaceReachabilityRules,
): Map<string, number> {
  const reachable = new Map<string, number>();
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

      const steps = current.steps + 1;
      visited.add(neighborIdentifier);
      reachable.set(neighborIdentifier, steps);

      if (
        rules.isStoppingSpace !== undefined &&
        rules.isStoppingSpace(neighborIdentifier) === true
      ) {
        continue;
      }

      queue.push({
        spaceIdentifier: neighborIdentifier,
        steps,
      });
    }
  }

  return reachable;
}
