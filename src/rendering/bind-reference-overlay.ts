import {
  appendReferenceOverlay,
  referenceOverlayFileIsPresent,
} from "./append-reference-overlay.ts";

export type OverlayFileIsPresent = () => Promise<boolean>;

type OverlayState = {
  group: SVGGElement | undefined;
  visible: boolean;
  showing: boolean;
};

export function bindReferenceOverlay(
  svg: SVGSVGElement,
  isLocal: boolean,
  overlayFileIsPresent: OverlayFileIsPresent = referenceOverlayFileIsPresent,
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
    svg.removeAttribute("data-reference-overlay-visible");
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

    overlay.group = appendReferenceOverlay(svg);
  }

  overlay.group.removeAttribute("display");
  svg.setAttribute("data-reference-overlay-visible", "true");
  overlay.visible = true;
}
