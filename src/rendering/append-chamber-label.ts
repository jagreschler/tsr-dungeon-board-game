import { SVG_NAMESPACE } from "./svg-namespace.ts";
import type { BoardBox } from "../board/board-grid.ts";

const LABEL_FILL = "#2b2118";

export function appendChamberLabel(
  group: SVGGElement,
  printedName: string,
  box: BoardBox,
): void {
  const words = printedName.split(" ");
  const lines = wrapChamberName(words);
  const text = document.createElementNS(SVG_NAMESPACE, "text");
  const fontSize = fontSizeForBox(box, lines);
  const lineHeight = fontSize * 1.1;
  const startY =
    box.y + box.height / 2 - ((lines.length - 1) * lineHeight) / 2 + fontSize / 3;

  text.setAttribute("x", String(box.x + box.width / 2));
  text.setAttribute("y", String(startY));
  text.setAttribute("text-anchor", "middle");
  text.setAttribute("fill", LABEL_FILL);
  text.setAttribute("font-size", String(fontSize));
  text.setAttribute("font-family", "Georgia, serif");
  text.setAttribute("data-printed-name", printedName);

  for (const [index, line] of lines.entries()) {
    const span = document.createElementNS(SVG_NAMESPACE, "tspan");
    span.setAttribute("x", String(box.x + box.width / 2));
    span.setAttribute("y", String(startY + index * lineHeight));
    span.textContent = line;
    text.append(span);
  }

  group.append(text);
}

function wrapChamberName(words: string[]): string[] {
  if (words.length <= 2) {
    return [words.join(" ")];
  }

  const first = words.slice(0, Math.ceil(words.length / 2)).join(" ");
  const second = words.slice(Math.ceil(words.length / 2)).join(" ");
  return [first, second];
}

function fontSizeForBox(box: BoardBox, lines: string[]): number {
  const longest = Math.max(...lines.map((line) => line.length));
  const byWidth = box.width / Math.max(longest * 0.62, 4);
  const byHeight = box.height / (lines.length * 2.2 + 1);
  return Math.max(9, Math.min(16, byWidth, byHeight));
}
