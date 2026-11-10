const GLOW_FILL = "rgba(80, 220, 120, 0.42)";
const GLOW_STROKE = "rgba(120, 255, 170, 0.95)";

export function paintMoveGlow(shape: SVGElement): void {
  shape.setAttribute("fill", GLOW_FILL);
  shape.setAttribute("stroke", GLOW_STROKE);
  shape.setAttribute("stroke-width", "3");
}
