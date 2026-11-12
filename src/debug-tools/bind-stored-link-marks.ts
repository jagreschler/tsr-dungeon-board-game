export function bindStoredLinkMarks(
  svg: SVGSVGElement,
  isLocal: boolean,
): () => void {
  if (isLocal === false) {
    return () => {};
  }

  const onKeyDown = (event: KeyboardEvent) => {
    toggleStoredLinkMarks(svg, event);
  };

  window.addEventListener("keydown", onKeyDown);
  return () => {
    window.removeEventListener("keydown", onKeyDown);
  };
}

function toggleStoredLinkMarks(
  svg: SVGSVGElement,
  event: KeyboardEvent,
): void {
  if (event.repeat || isToggleKey(event) === false) {
    return;
  }

  if (svg.getAttribute("data-stored-link-marks-visible") === "true") {
    svg.removeAttribute("data-stored-link-marks-visible");
    return;
  }

  svg.setAttribute("data-stored-link-marks-visible", "true");
}

function isToggleKey(event: KeyboardEvent): boolean {
  if (event.shiftKey || (event.key !== "l" && event.key !== "L")) {
    return false;
  }

  return (
    event.ctrlKey === false &&
    event.metaKey === false &&
    event.altKey === false
  );
}
