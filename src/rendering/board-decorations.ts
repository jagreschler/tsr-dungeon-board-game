export type BoardDecoration = {
  identifier: string;
  decoration: "stairs";
};

export const boardDecorations: readonly BoardDecoration[] = [
  { identifier: "corridor-855-765", decoration: "stairs" },
];

export function decorationFor(
  identifier: string,
): BoardDecoration["decoration"] | undefined {
  const entry = boardDecorations.find((candidate) => {
    return candidate.identifier === identifier;
  });

  return entry?.decoration;
}
