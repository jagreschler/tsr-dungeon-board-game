export function bindMoveStepLabels(
  svg: SVGSVGElement,
  isLocal: boolean,
): () => void {
  if (isLocal === false) {
    return () => {};
  }

  const onKeyDown = (event: KeyboardEvent) => {
    toggleStepLabels(svg, event);
  };

  window.addEventListener("keydown", onKeyDown);
  return () => {
    window.removeEventListener("keydown", onKeyDown);
  };
}

function toggleStepLabels(
  svg: SVGSVGElement,
  event: KeyboardEvent,
): void {
  if (event.repeat || isToggleKey(event) === false) {
    return;
  }

  if (svg.getAttribute("data-move-step-labels-visible") === "true") {
    svg.removeAttribute("data-move-step-labels-visible");
    return;
  }

  svg.setAttribute("data-move-step-labels-visible", "true");
}

function isToggleKey(event: KeyboardEvent): boolean {
  if (event.key !== "d" && event.key !== "D") {
    return false;
  }

  return (
    event.ctrlKey === false &&
    event.metaKey === false &&
    event.altKey === false
  );
}
