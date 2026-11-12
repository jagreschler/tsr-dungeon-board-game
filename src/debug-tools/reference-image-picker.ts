import {
  REFERENCE_BOARD_IMAGE_HEIGHT,
  REFERENCE_BOARD_IMAGE_WIDTH,
} from "./append-reference-overlay.ts";
import {
  EVENT_REFERENCE_IMAGE_LOADED,
  type ReferenceImageLoadedDetail,
} from "./reference-image-events.ts";
import { ReferenceImageFile } from "./reference-image-file.ts";

export class ReferenceImagePicker {
  private placed = false;

  constructor(
    private readonly svg: SVGSVGElement,
    private readonly imageFile: ReferenceImageFile = new ReferenceImageFile(),
  ) {}

  place(): void {
    if (this.placed) {
      return;
    }

    if ((this.svg.parentElement instanceof HTMLElement) === false) {
      return;
    }

    this.placed = true;
    this.svg.after(this.controls());
  }

  private controls(): HTMLElement {
    const root = document.createElement("div");
    root.setAttribute("data-reference-image-picker", "true");

    const button = document.createElement("button");
    button.type = "button";
    button.textContent = "Load reference image";

    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/png,image/*";
    input.hidden = true;

    const message = document.createElement("p");
    message.setAttribute("data-reference-image-picker-message", "true");
    message.hidden = true;

    button.addEventListener("click", () => {
      input.click();
    });
    input.addEventListener("change", () => {
      void this.onFileChosen(input, message);
    });

    root.append(button, input, message);
    return root;
  }

  private async onFileChosen(
    input: HTMLInputElement,
    message: HTMLParagraphElement,
  ): Promise<void> {
    const file = input.files?.[0];
    if (file === undefined) {
      return;
    }

    let loaded: ReferenceImageLoadedDetail;
    try {
      loaded = await this.imageFile.read(file);
    } catch {
      message.hidden = false;
      message.textContent = "Could not read that image.";
      return;
    }

    if (this.imageFile.matchesPrintedBoard(loaded)) {
      message.hidden = true;
      message.textContent = "";
    } else {
      message.hidden = false;
      message.textContent = `This image is ${loaded.width}×${loaded.height}. The printed board is ${REFERENCE_BOARD_IMAGE_WIDTH}×${REFERENCE_BOARD_IMAGE_HEIGHT}.`;
    }

    this.svg.dispatchEvent(
      new CustomEvent<ReferenceImageLoadedDetail>(EVENT_REFERENCE_IMAGE_LOADED, {
        detail: loaded,
      }),
    );
  }
}
