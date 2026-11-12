import {
  REFERENCE_BOARD_IMAGE_HEIGHT,
  REFERENCE_BOARD_IMAGE_WIDTH,
} from "./append-reference-overlay.ts";
import type { ReferenceImageLoadedDetail } from "./reference-image-events.ts";

export type ImageSize = {
  width: number;
  height: number;
};

export class ReferenceImageFile {
  private lastHref: string | undefined;

  constructor(
    private readonly sizeOfImage: (
      href: string,
    ) => Promise<ImageSize> = naturalSize,
  ) {}

  async read(file: File): Promise<ReferenceImageLoadedDetail> {
    const href = URL.createObjectURL(file);
    let size: ImageSize;
    try {
      size = await this.sizeOfImage(href);
    } catch {
      URL.revokeObjectURL(href);
      throw new Error("Could not read that image.");
    }

    this.revokeLastHref();
    this.lastHref = href;
    return {
      href,
      width: size.width,
      height: size.height,
    };
  }

  matchesPrintedBoard(size: ImageSize): boolean {
    return (
      size.width === REFERENCE_BOARD_IMAGE_WIDTH &&
      size.height === REFERENCE_BOARD_IMAGE_HEIGHT
    );
  }

  private revokeLastHref(): void {
    if (this.lastHref === undefined) {
      return;
    }

    URL.revokeObjectURL(this.lastHref);
    this.lastHref = undefined;
  }
}

function naturalSize(href: string): Promise<ImageSize> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => {
      resolve({ width: image.naturalWidth, height: image.naturalHeight });
    });
    image.addEventListener("error", () => {
      reject(new Error("Could not read that image."));
    });
    image.src = href;
  });
}
