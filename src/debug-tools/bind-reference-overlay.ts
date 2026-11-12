import {
  appendReferenceOverlay,
  referenceOverlayFileIsPresent,
  referenceOverlayHref,
} from "./append-reference-overlay.ts";
import {
  EVENT_REFERENCE_IMAGE_LOADED,
  type ReferenceImageLoadedDetail,
} from "./load-reference-image-button.ts";

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
  let loadedHref: string | undefined;

  const onKeyDown = (event: KeyboardEvent) => {
    void toggleOverlay(svg, overlay, overlayFileIsPresent, loadedHref, event);
  };
  const onReferenceImageLoaded = (event: Event) => {
    loadedHref = loadedHrefFromEvent(event);
    if (loadedHref === undefined) {
      return;
    }

    overlay.group?.querySelector("image")?.setAttribute("href", loadedHref);
  };

  window.addEventListener("keydown", onKeyDown);
  svg.addEventListener(EVENT_REFERENCE_IMAGE_LOADED, onReferenceImageLoaded);
  return () => {
    window.removeEventListener("keydown", onKeyDown);
    svg.removeEventListener(EVENT_REFERENCE_IMAGE_LOADED, onReferenceImageLoaded);
  };
}

async function toggleOverlay(
  svg: SVGSVGElement,
  overlay: OverlayState,
  overlayFileIsPresent: OverlayFileIsPresent,
  loadedHref: string | undefined,
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
    await showOverlay(svg, overlay, overlayFileIsPresent, loadedHref);
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
  loadedHref: string | undefined,
): Promise<void> {
  if (overlay.group === undefined) {
    const present =
      loadedHref !== undefined || (await overlayFileIsPresent());
    if (present === false) {
      return;
    }

    overlay.group = appendReferenceOverlay(
      svg,
      loadedHref ?? referenceOverlayHref(),
    );
  }

  overlay.group.removeAttribute("display");
  svg.setAttribute("data-reference-overlay-visible", "true");
  overlay.visible = true;
}

function loadedHrefFromEvent(event: Event): string | undefined {
  if ((event instanceof CustomEvent) === false) {
    return undefined;
  }

  const detail = event.detail as ReferenceImageLoadedDetail;
  if (typeof detail.href !== "string" || detail.href === "") {
    return undefined;
  }

  return detail.href;
}
