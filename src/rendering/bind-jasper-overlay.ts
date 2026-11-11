import {
  appendJasperOverlay,
  jasperOverlayFileIsPresent,
} from "./append-jasper-overlay.ts";

export type OverlayFileIsPresent = () => Promise<boolean>;

type OverlayState = {
  group: SVGGElement | undefined;
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
    group: undefined,
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
    overlay.group?.setAttribute("display", "none");
    svg.removeAttribute("data-jasper-overlay-visible");
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
  if (overlay.group === undefined) {
    const present = await overlayFileIsPresent();
    if (present === false) {
      return;
    }

    overlay.group = appendJasperOverlay(svg);
  }

  overlay.group.removeAttribute("display");
  svg.setAttribute("data-jasper-overlay-visible", "true");
  overlay.visible = true;
}
