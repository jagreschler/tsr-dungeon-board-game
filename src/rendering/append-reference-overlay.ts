import { SVG_NAMESPACE } from "./svg-namespace.ts";

const REFERENCE_BOARD_IMAGE_FILE = "reference-board-map.png";
const REFERENCE_BOARD_IMAGE_WIDTH = 2200;
const REFERENCE_BOARD_IMAGE_HEIGHT = 1702;
const REFERENCE_OVERLAY_BACKING_FILL = "#808080";

export function referenceOverlayHref(): string {
  return `${import.meta.env.BASE_URL}local-reference/${REFERENCE_BOARD_IMAGE_FILE}`;
}

export async function referenceOverlayFileIsPresent(): Promise<boolean> {
  try {
    const response = await fetch(referenceOverlayHref());
    return response.ok;
  } catch {
    return false;
  }
}

export function appendReferenceOverlay(svg: SVGSVGElement): SVGGElement {
  const group = document.createElementNS(SVG_NAMESPACE, "g");
  group.setAttribute("data-reference-overlay", "true");
  group.setAttribute("pointer-events", "none");
  group.append(backingRect(), overlayImage());

  const playOverlay = svg.querySelector("[data-play-overlay]");
  if (playOverlay === null) {
    svg.append(group);
  } else {
    playOverlay.before(group);
  }

  return group;
}

function backingRect(): SVGRectElement {
  const backing = document.createElementNS(SVG_NAMESPACE, "rect");
  backing.setAttribute("data-reference-overlay-backing", "true");
  backing.setAttribute("fill", REFERENCE_OVERLAY_BACKING_FILL);
  backing.setAttribute("x", "0");
  backing.setAttribute("y", "0");
  backing.setAttribute("width", String(REFERENCE_BOARD_IMAGE_WIDTH));
  backing.setAttribute("height", String(REFERENCE_BOARD_IMAGE_HEIGHT));
  backing.setAttribute("pointer-events", "none");
  return backing;
}

function overlayImage(): SVGImageElement {
  const image = document.createElementNS(SVG_NAMESPACE, "image");
  image.setAttribute("href", referenceOverlayHref());
  image.setAttribute("x", "0");
  image.setAttribute("y", "0");
  image.setAttribute("width", String(REFERENCE_BOARD_IMAGE_WIDTH));
  image.setAttribute("height", String(REFERENCE_BOARD_IMAGE_HEIGHT));
  image.setAttribute("opacity", "0.5");
  image.setAttribute("pointer-events", "none");
  return image;
}
