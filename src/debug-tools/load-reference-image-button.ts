import type { OverlayDrawnDetail } from "../dungeon-session.ts";
import { EVENT_OVERLAY_DRAWN } from "../dungeon-session.ts";
import {
  REFERENCE_BOARD_IMAGE_HEIGHT,
  REFERENCE_BOARD_IMAGE_WIDTH,
} from "./append-reference-overlay.ts";

export const EVENT_REFERENCE_IMAGE_LOADED = "ReferenceImageLoaded";

export type ReferenceImageLoadedDetail = {
  href: string;
  width: number;
  height: number;
};

export type ImageSize = {
  width: number;
  height: number;
};

export class LoadReferenceImageButton {
  private mounted = false;
  private lastHref: string | undefined;

  constructor(
    private readonly sizeOfImage: (
      href: string,
    ) => Promise<ImageSize> = naturalSize,
  ) {}

  listenForOverlayDrawn(session: EventTarget): void {
    session.addEventListener(EVENT_OVERLAY_DRAWN, (event) => {
      this.onOverlayDrawn(event);
    });
  }

  private onOverlayDrawn(event: Event): void {
    if ((event instanceof CustomEvent) === false) {
      return;
    }

    if (this.mounted) {
      return;
    }

    this.mounted = true;
    const detail = event.detail as OverlayDrawnDetail;
    this.place(detail.svg, this.controls(detail.svg));
  }

  private controls(svg: SVGSVGElement): HTMLElement {
    const root = document.createElement("div");
    root.setAttribute("data-load-reference-image", "true");

    const button = document.createElement("button");
    button.type = "button";
    button.textContent = "Load reference image";

    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/png,image/*";
    input.hidden = true;

    const message = document.createElement("p");
    message.setAttribute("data-load-reference-image-message", "true");
    message.hidden = true;

    button.addEventListener("click", () => {
      input.click();
    });
    input.addEventListener("change", () => {
      void this.onFileChosen(svg, input, message);
    });

    root.append(button, input, message);
    return root;
  }

  private place(svg: SVGSVGElement, controls: HTMLElement): void {
    if (svg.parentElement instanceof HTMLElement) {
      svg.after(controls);
      return;
    }

    queueMicrotask(() => {
      if (svg.parentElement instanceof HTMLElement) {
        svg.after(controls);
        return;
      }

      document.body.append(controls);
    });
  }

  private async onFileChosen(
    svg: SVGSVGElement,
    input: HTMLInputElement,
    message: HTMLParagraphElement,
  ): Promise<void> {
    const file = input.files?.[0];
    if (file === undefined) {
      return;
    }

    const href = URL.createObjectURL(file);
    let size: ImageSize;
    try {
      size = await this.sizeOfImage(href);
    } catch {
      URL.revokeObjectURL(href);
      message.hidden = false;
      message.textContent = "Could not read that image.";
      return;
    }

    if (
      size.width === REFERENCE_BOARD_IMAGE_WIDTH &&
      size.height === REFERENCE_BOARD_IMAGE_HEIGHT
    ) {
      message.hidden = true;
      message.textContent = "";
    } else {
      message.hidden = false;
      message.textContent = `This image is ${size.width}×${size.height}. The printed board is ${REFERENCE_BOARD_IMAGE_WIDTH}×${REFERENCE_BOARD_IMAGE_HEIGHT}.`;
    }

    if (this.lastHref !== undefined) {
      URL.revokeObjectURL(this.lastHref);
    }
    this.lastHref = href;

    svg.dispatchEvent(
      new CustomEvent<ReferenceImageLoadedDetail>(EVENT_REFERENCE_IMAGE_LOADED, {
        detail: {
          href,
          width: size.width,
          height: size.height,
        },
      }),
    );
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
