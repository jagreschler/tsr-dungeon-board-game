import { SVG_NAMESPACE } from "./svg-namespace.ts";

const JASPER_BOARD_IMAGE_FILE = "jasper-dungeon-map-standard-orientation.png";
const JASPER_BOARD_IMAGE_WIDTH = 2200;
const JASPER_BOARD_IMAGE_HEIGHT = 1702;

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

export function appendJasperOverlay(svg: SVGSVGElement): SVGImageElement {
  const image = document.createElementNS(SVG_NAMESPACE, "image");
  image.setAttribute("data-jasper-overlay", "true");
  image.setAttribute("href", jasperOverlayHref());
  image.setAttribute("x", "0");
  image.setAttribute("y", "0");
  image.setAttribute("width", String(JASPER_BOARD_IMAGE_WIDTH));
  image.setAttribute("height", String(JASPER_BOARD_IMAGE_HEIGHT));
  image.setAttribute("opacity", "0.5");
  image.setAttribute("pointer-events", "none");

  const playOverlay = svg.querySelector("[data-play-overlay]");
  if (playOverlay === null) {
    svg.append(image);
  } else {
    playOverlay.before(image);
  }

  return image;
}
