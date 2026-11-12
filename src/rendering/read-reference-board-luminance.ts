import { inflateSync } from "node:zlib";
import fs from "node:fs";
import path from "node:path";

export const REFERENCE_BOARD_IMAGE_PATH = path.resolve(
  "local-reference",
  "reference-board-map.png",
);

export const REFERENCE_BOARD_WIDTH = 2200;
export const REFERENCE_BOARD_HEIGHT = 1702;

const PNG_SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

export type ReferenceBoardLuminance = {
  width: number;
  height: number;
  luminance: Uint8Array;
};

export function referenceBoardImageIsPresent(): boolean {
  return fs.existsSync(REFERENCE_BOARD_IMAGE_PATH);
}

export function readReferenceBoardLuminance(): ReferenceBoardLuminance {
  const bytes = fs.readFileSync(REFERENCE_BOARD_IMAGE_PATH);
  return decodePngLuminance(bytes);
}

export function decodePngLuminance(bytes: Buffer): ReferenceBoardLuminance {
  if (bytes.subarray(0, 8).equals(PNG_SIGNATURE) === false) {
    throw new Error("reference board is not a PNG");
  }

  let width = 0;
  let height = 0;
  let bitDepth = 0;
  let colorType = 0;
  let interlace = 0;
  const idat: Buffer[] = [];
  let offset = 8;

  while (offset + 12 <= bytes.length) {
    const length = bytes.readUInt32BE(offset);
    const type = bytes.subarray(offset + 4, offset + 8).toString("ascii");
    const data = bytes.subarray(offset + 8, offset + 8 + length);
    offset += 12 + length;

    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      bitDepth = data[8] ?? 0;
      colorType = data[9] ?? 0;
      interlace = data[12] ?? 0;
    } else if (type === "IDAT") {
      idat.push(Buffer.from(data));
    } else if (type === "IEND") {
      break;
    }
  }

  if (interlace !== 0) {
    throw new Error("reference board PNG must not be interlaced");
  }

  if (width !== REFERENCE_BOARD_WIDTH || height !== REFERENCE_BOARD_HEIGHT) {
    throw new Error(
      `reference board is ${width}×${height}, expected ${REFERENCE_BOARD_WIDTH}×${REFERENCE_BOARD_HEIGHT}`,
    );
  }

  if (bitDepth !== 8 || (colorType !== 0 && colorType !== 2 && colorType !== 6)) {
    throw new Error(
      `reference board PNG must be 8-bit gray, RGB, or RGBA, got depth ${bitDepth} type ${colorType}`,
    );
  }

  const bytesPerPixel = colorType === 6 ? 4 : colorType === 2 ? 3 : 1;
  const stride = width * bytesPerPixel;
  const inflated = inflateSync(Buffer.concat(idat));
  const raw = unfilterPng(inflated, width, height, bytesPerPixel);
  const luminance = new Uint8Array(width * height);

  for (let y = 0; y < height; y += 1) {
    const row = y * stride;
    const outRow = y * width;
    for (let x = 0; x < width; x += 1) {
      const pixel = row + x * bytesPerPixel;
      if (colorType === 0) {
        luminance[outRow + x] = raw[pixel] ?? 0;
        continue;
      }

      const red = raw[pixel] ?? 0;
      const green = raw[pixel + 1] ?? 0;
      const blue = raw[pixel + 2] ?? 0;
      luminance[outRow + x] = Math.round((red + green + blue) / 3);
    }
  }

  return { width, height, luminance };
}

function unfilterPng(
  inflated: Buffer,
  width: number,
  height: number,
  bytesPerPixel: number,
): Uint8Array {
  const stride = width * bytesPerPixel;
  const raw = new Uint8Array(stride * height);
  let source = 0;

  for (let y = 0; y < height; y += 1) {
    const filter = inflated[source] ?? 0;
    source += 1;
    const row = y * stride;
    const previousRow = y === 0 ? undefined : (y - 1) * stride;

    for (let index = 0; index < stride; index += 1) {
      const sample = inflated[source + index] ?? 0;
      const left = index >= bytesPerPixel ? (raw[row + index - bytesPerPixel] ?? 0) : 0;
      const up =
        previousRow === undefined ? 0 : (raw[previousRow + index] ?? 0);
      const upLeft =
        previousRow === undefined || index < bytesPerPixel
          ? 0
          : (raw[previousRow + index - bytesPerPixel] ?? 0);
      raw[row + index] = (sample + paethPredictor(filter, left, up, upLeft)) & 255;
    }

    source += stride;
  }

  return raw;
}

function paethPredictor(
  filter: number,
  left: number,
  up: number,
  upLeft: number,
): number {
  if (filter === 0) {
    return 0;
  }

  if (filter === 1) {
    return left;
  }

  if (filter === 2) {
    return up;
  }

  if (filter === 3) {
    return Math.floor((left + up) / 2);
  }

  if (filter !== 4) {
    throw new Error(`unsupported PNG filter ${filter}`);
  }

  const estimate = left + up - upLeft;
  const distanceLeft = Math.abs(estimate - left);
  const distanceUp = Math.abs(estimate - up);
  const distanceUpLeft = Math.abs(estimate - upLeft);

  if (distanceLeft <= distanceUp && distanceLeft <= distanceUpLeft) {
    return left;
  }

  if (distanceUp <= distanceUpLeft) {
    return up;
  }

  return upLeft;
}
