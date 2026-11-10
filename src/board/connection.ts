export type Connection = {
  fromSpaceIdentifier: string;
  toSpaceIdentifier: string;
};

export function createConnection(
  fromSpaceIdentifier: string,
  toSpaceIdentifier: string,
): Connection {
  return {
    fromSpaceIdentifier,
    toSpaceIdentifier,
  };
}
