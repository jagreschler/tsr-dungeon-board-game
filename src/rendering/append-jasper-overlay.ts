import { SVG_NAMESPACE } from "./svg-namespace.ts";

const JASPER_BOARD_IMAGE_FILE = "jasper-dungeon-map-standard-orientation.png";
const JASPER_BOARD_IMAGE_WIDTH = 2200;
const JASPER_BOARD_IMAGE_HEIGHT = 1702;
const JASPER_OVERLAY_BACKING_FILL = "#808080";

export function jasperOverlayHref(): string {
  return `${import.meta.env.BASE_URL}local-reference/${JASPER_BOARD_IMAGE_FILE}`;
}

export async function jasperOverlayFileIsPresent(): Promise<boolean> {
  try {
    const response = await fetch(jasperOverlayHref());
    return response.ok;
  } catch {
    return false;
  }
}

export function appendJasperOverlay(svg: SVGSVGElement): SVGGElement {
  const group = document.createElementNS(SVG_NAMESPACE, "g");
  group.setAttribute("data-jasper-overlay", "true");
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
  backing.setAttribute("data-jasper-overlay-backing", "true");
  backing.setAttribute("fill", JASPER_OVERLAY_BACKING_FILL);
  backing.setAttribute("x", "0");
  backing.setAttribute("y", "0");
  backing.setAttribute("width", String(JASPER_BOARD_IMAGE_WIDTH));
  backing.setAttribute("height", String(JASPER_BOARD_IMAGE_HEIGHT));
  backing.setAttribute("pointer-events", "none");
  return backing;
}

function overlayImage(): SVGImageElement {
  const image = document.createElementNS(SVG_NAMESPACE, "image");
  image.setAttribute("href", jasperOverlayHref());
  image.setAttribute("x", "0");
  image.setAttribute("y", "0");
  image.setAttribute("width", String(JASPER_BOARD_IMAGE_WIDTH));
  image.setAttribute("height", String(JASPER_BOARD_IMAGE_HEIGHT));
  image.setAttribute("opacity", "0.5");
  image.setAttribute("pointer-events", "none");
  return image;
}
