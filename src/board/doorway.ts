export type DoorwayKind = "door" | "secretDoor";

export type Doorway = {
  identifier: string;
  kind: DoorwayKind;
  fromSpaceIdentifier: string;
  toSpaceIdentifier: string;
};

export function createDoorway(
  identifier: string,
  kind: DoorwayKind,
  fromSpaceIdentifier: string,
  toSpaceIdentifier: string,
): Doorway {
  return {
    identifier,
    kind,
    fromSpaceIdentifier,
    toSpaceIdentifier,
  };
}
