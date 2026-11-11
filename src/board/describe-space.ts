import type { Space } from "./space.ts";
import type { SpaceKind } from "./space-kind.ts";

const KIND_LABEL: Record<SpaceKind, string> = {
  room: "Room",
  chamber: "Chamber",
  corridor: "Corridor",
  mainStaircase: "Main Staircase",
  mainGallery: "Main Gallery",
  stairs: "Stairs",
};

export function describeSpace(space: Space): string {
  const name = space.printedName ?? nameFromKindAndIdentifier(space);
  return `${name}, level ${space.level}`;
}

function nameFromKindAndIdentifier(space: Space): string {
  const kindLabel = KIND_LABEL[space.kind];
  const kebab = kebabFromKind(space.kind);

  if (space.identifier === kebab) {
    return kindLabel;
  }

  const prefix = `${kebab}-`;
  if (space.identifier.startsWith(prefix)) {
    const rest = space.identifier.slice(prefix.length);
    return `${kindLabel} ${readableRest(rest)}`;
  }

  return readableRest(space.identifier);
}

function kebabFromKind(kind: SpaceKind): string {
  if (kind === "mainStaircase") {
    return "main-staircase";
  }

  if (kind === "mainGallery") {
    return "main-gallery";
  }

  return kind;
}

function readableRest(rest: string): string {
  const parts = rest.split("-");
  const hasLetter = parts.some((part) => /[a-zA-Z]/.test(part));
  if (hasLetter === false) {
    return rest;
  }

  return parts.map(titleCase).join(" ");
}

function titleCase(part: string): string {
  return part.slice(0, 1).toUpperCase() + part.slice(1);
}
