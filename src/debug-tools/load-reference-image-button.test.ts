import { afterEach, describe, expect, it } from "vitest";
import { dungeonBoard } from "../board/dungeon-board.ts";
import { dungeonLayout } from "../board/dungeon-layout.ts";
import { DungeonSession } from "../dungeon-session.ts";
import { heroPiece } from "../pieces/hero-piece.ts";
import { bindReferenceOverlay } from "./bind-reference-overlay.ts";
import {
  EVENT_REFERENCE_IMAGE_LOADED,
  LoadReferenceImageButton,
  type ReferenceImageLoadedDetail,
} from "./load-reference-image-button.ts";

afterEach(() => {
  document.body.replaceChildren();
});

describe("LoadReferenceImageButton", () => {
  it("does not add the button unless it is listening", async () => {
    const session = new DungeonSession(dungeonBoard, dungeonLayout, heroPiece);
    const svg = session.element();
    document.body.append(svg);
    await Promise.resolve();

    expect(document.querySelector("[data-load-reference-image]") === null).toBe(
      true,
    );
  });

  it("adds a Load reference image button after OverlayDrawn", async () => {
    const session = new DungeonSession(dungeonBoard, dungeonLayout, heroPiece);
    new LoadReferenceImageButton().listenForOverlayDrawn(session);
    const svg = session.element();
    document.body.append(svg);
    await Promise.resolve();

    const button = document.querySelector("[data-load-reference-image] button");
    expect(button === null).toBe(false);
    expect(button?.textContent).toBe("Load reference image");
  });

  it("does not add a second button after a Hero move", async () => {
    const session = new DungeonSession(dungeonBoard, dungeonLayout, heroPiece);
    new LoadReferenceImageButton().listenForOverlayDrawn(session);
    const svg = session.element();
    document.body.append(svg);
    await Promise.resolve();

    svg
      .querySelector("[data-move-highlight='main-gallery']")
      ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await Promise.resolve();

    expect(document.querySelectorAll("[data-load-reference-image]").length).toBe(
      1,
    );
  });

  it("publishes ReferenceImageLoaded from a picked 2200×1702 file and leaves no warning", async () => {
    const session = new DungeonSession(dungeonBoard, dungeonLayout, heroPiece);
    new LoadReferenceImageButton(async () => {
      return { width: 2200, height: 1702 };
    }).listenForOverlayDrawn(session);
    const svg = session.element();
    document.body.append(svg);
    await Promise.resolve();

    let loaded: ReferenceImageLoadedDetail | undefined;
    svg.addEventListener(EVENT_REFERENCE_IMAGE_LOADED, ((
      event: CustomEvent<ReferenceImageLoadedDetail>,
    ) => {
      loaded = event.detail;
    }) as EventListener);

    await chooseFile(pngFile("jasper-dungeon-map-standard-orientation.png"));

    expect(loaded === undefined).toBe(false);
    expect(loaded?.href.startsWith("blob:")).toBe(true);
    expect(loaded?.width).toBe(2200);
    expect(loaded?.height).toBe(1702);
    expect(warningMessage()?.hidden).toBe(true);
  });

  it("still loads a wrong-size image and shows a short size warning", async () => {
    const session = new DungeonSession(dungeonBoard, dungeonLayout, heroPiece);
    new LoadReferenceImageButton(async () => {
      return { width: 100, height: 50 };
    }).listenForOverlayDrawn(session);
    const svg = session.element();
    document.body.append(svg);
    await Promise.resolve();

    let loaded: ReferenceImageLoadedDetail | undefined;
    svg.addEventListener(EVENT_REFERENCE_IMAGE_LOADED, ((
      event: CustomEvent<ReferenceImageLoadedDetail>,
    ) => {
      loaded = event.detail;
    }) as EventListener);

    await chooseFile(pngFile("tiny.png"));

    expect(loaded === undefined).toBe(false);
    expect(loaded?.href.startsWith("blob:")).toBe(true);
    expect(loaded?.width).toBe(100);
    expect(loaded?.height).toBe(50);
    expect(warningMessage()?.hidden).toBe(false);
    expect(warningMessage()?.textContent ?? "").toContain("100×50");
    expect(warningMessage()?.textContent ?? "").toContain("2200×1702");
  });

  it("lets B show the picked image when the local PNG is missing", async () => {
    const session = new DungeonSession(dungeonBoard, dungeonLayout, heroPiece);
    new LoadReferenceImageButton(async () => {
      return { width: 2200, height: 1702 };
    }).listenForOverlayDrawn(session);
    const svg = session.element();
    document.body.append(svg);
    await Promise.resolve();
    bindReferenceOverlay(svg, true, async () => {
      return false;
    });

    await chooseFile(pngFile("jasper-dungeon-map-standard-orientation.png"));
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "b" }));
    await Promise.resolve();

    const image = svg.querySelector("[data-reference-overlay] image");
    expect(image === null).toBe(false);
    expect(image?.getAttribute("href") ?? "").toMatch(/^blob:/);
    expect(svg.getAttribute("data-reference-overlay-visible")).toBe("true");
  });
});

function pngFile(name: string): File {
  return new File([new Uint8Array([137, 80, 78, 71])], name, {
    type: "image/png",
  });
}

async function chooseFile(file: File): Promise<void> {
  const input = document.querySelector(
    "[data-load-reference-image] input[type='file']",
  );
  if ((input instanceof HTMLInputElement) === false) {
    throw new Error("missing file input");
  }

  Object.defineProperty(input, "files", {
    configurable: true,
    value: [file],
  });
  input.dispatchEvent(new Event("change", { bubbles: true }));
  await Promise.resolve();
  await Promise.resolve();
}

function warningMessage(): HTMLParagraphElement | null {
  const message = document.querySelector(
    "[data-load-reference-image-message]",
  );
  if (message instanceof HTMLParagraphElement) {
    return message;
  }

  return null;
}
