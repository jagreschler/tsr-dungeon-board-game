export type ConnectionKind = "open" | "door" | "secretDoor";

export type Connection = {
  fromSpaceIdentifier: string;
  toSpaceIdentifier: string;
  kind: ConnectionKind;
};

export function createConnection(
  fromSpaceIdentifier: string,
  toSpaceIdentifier: string,
  kind: ConnectionKind,
): Connection {
  return {
    fromSpaceIdentifier,
    toSpaceIdentifier,
    kind,
  };
}
