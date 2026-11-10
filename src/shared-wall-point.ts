export type BoardPoint = {
  x: number;
  y: number;
};

export function pointOnSharedWall(
  wallOutline: readonly BoardPoint[],
  neighborOutline: readonly BoardPoint[],
): BoardPoint {
  let bestDistance = Number.POSITIVE_INFINITY;
  let bestPoint = wallOutline[0] ?? { x: 0, y: 0 };

  for (const wallEdge of edgesOf(wallOutline)) {
    for (const neighborEdge of edgesOf(neighborOutline)) {
      const closest = closestPointsOnSegments(wallEdge, neighborEdge);

      if (closest.distance < bestDistance) {
        bestDistance = closest.distance;
        bestPoint = closest.first;
      }
    }
  }

  return bestPoint;
}

function edgesOf(
  outline: readonly BoardPoint[],
): { start: BoardPoint; end: BoardPoint }[] {
  const edges: { start: BoardPoint; end: BoardPoint }[] = [];

  for (let index = 0; index < outline.length; index += 1) {
    const start = outline[index];
    const end = outline[(index + 1) % outline.length];

    if (start !== undefined && end !== undefined) {
      edges.push({ start, end });
    }
  }

  return edges;
}

function closestPointsOnSegments(
  first: { start: BoardPoint; end: BoardPoint },
  second: { start: BoardPoint; end: BoardPoint },
): { first: BoardPoint; second: BoardPoint; distance: number } {
  const candidates = [
    {
      first: closestPointOnSegment(first.start, first.end, second.start),
      second: second.start,
    },
    {
      first: closestPointOnSegment(first.start, first.end, second.end),
      second: second.end,
    },
    {
      first: first.start,
      second: closestPointOnSegment(second.start, second.end, first.start),
    },
    {
      first: first.end,
      second: closestPointOnSegment(second.start, second.end, first.end),
    },
  ];

  let best = candidates[0] ?? {
    first: first.start,
    second: second.start,
  };
  let bestDistance = distanceBetween(best.first, best.second);

  for (const candidate of candidates) {
    const distance = distanceBetween(candidate.first, candidate.second);
    if (distance < bestDistance) {
      best = candidate;
      bestDistance = distance;
    }
  }

  return { first: best.first, second: best.second, distance: bestDistance };
}

function closestPointOnSegment(
  start: BoardPoint,
  end: BoardPoint,
  point: BoardPoint,
): BoardPoint {
  const spanX = end.x - start.x;
  const spanY = end.y - start.y;
  const spanLengthSquared = spanX * spanX + spanY * spanY;

  if (spanLengthSquared === 0) {
    return start;
  }

  const along =
    ((point.x - start.x) * spanX + (point.y - start.y) * spanY) /
    spanLengthSquared;
  const clamped = Math.max(0, Math.min(1, along));

  return {
    x: start.x + clamped * spanX,
    y: start.y + clamped * spanY,
  };
}

function distanceBetween(first: BoardPoint, second: BoardPoint): number {
  return Math.hypot(first.x - second.x, first.y - second.y);
}
