import {
  appendJasperOverlay,
  jasperOverlayFileIsPresent,
} from "./append-jasper-overlay.ts";

export type OverlayFileIsPresent = () => Promise<boolean>;

type OverlayState = {
  image: SVGImageElement | undefined;
  visible: boolean;
  showing: boolean;
};

export function bindJasperOverlay(
  svg: SVGSVGElement,
  isLocal: boolean,
  overlayFileIsPresent: OverlayFileIsPresent = jasperOverlayFileIsPresent,
): () => void {
  if (isLocal === false) {
    return () => {};
  }

  const overlay: OverlayState = {
    image: undefined,
    visible: false,
    showing: false,
  };

  const onKeyDown = (event: KeyboardEvent) => {
    void toggleOverlay(svg, overlay, overlayFileIsPresent, event);
  };

  window.addEventListener("keydown", onKeyDown);
  return () => {
    window.removeEventListener("keydown", onKeyDown);
  };
}

async function toggleOverlay(
  svg: SVGSVGElement,
  overlay: OverlayState,
  overlayFileIsPresent: OverlayFileIsPresent,
  event: KeyboardEvent,
): Promise<void> {
  if (event.repeat || isToggleKey(event) === false) {
    return;
  }

  if (overlay.visible) {
    overlay.image?.setAttribute("display", "none");
    overlay.visible = false;
    return;
  }

  if (overlay.showing) {
    return;
  }

  overlay.showing = true;
  try {
    await showOverlay(svg, overlay, overlayFileIsPresent);
  } finally {
    overlay.showing = false;
  }
}

function isToggleKey(event: KeyboardEvent): boolean {
  if (event.key !== "b" && event.key !== "B") {
    return false;
  }

  return event.ctrlKey === false && event.metaKey === false && event.altKey === false;
}

async function showOverlay(
  svg: SVGSVGElement,
  overlay: OverlayState,
  overlayFileIsPresent: OverlayFileIsPresent,
): Promise<void> {
  if (overlay.image === undefined) {
    const present = await overlayFileIsPresent();
    if (present === false) {
      return;
    }

    overlay.image = appendJasperOverlay(svg);
  }

  overlay.image.removeAttribute("display");
  overlay.visible = true;
}
