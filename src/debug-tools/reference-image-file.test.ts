import { afterEach, describe, expect, it } from "vitest";
import { ReferenceImageFile } from "./reference-image-file.ts";

afterEach(() => {
  document.body.replaceChildren();
});

describe("ReferenceImageFile", () => {
  it("reads a local file to a blob URL and its pixel size", async () => {
    const imageFile = new ReferenceImageFile(async () => {
      return { width: 2200, height: 1702 };
    });

    const loaded = await imageFile.read(pngFile("board.png"));

    expect(loaded.href.startsWith("blob:")).toBe(true);
    expect(loaded.width).toBe(2200);
    expect(loaded.height).toBe(1702);
    expect(imageFile.matchesPrintedBoard(loaded)).toBe(true);
  });

  it("does not match the printed board when the size is wrong", async () => {
    const imageFile = new ReferenceImageFile(async () => {
      return { width: 100, height: 50 };
    });

    const loaded = await imageFile.read(pngFile("tiny.png"));

    expect(imageFile.matchesPrintedBoard(loaded)).toBe(false);
  });

  it("revokes the previous blob URL when a new file is read", async () => {
    const imageFile = new ReferenceImageFile(async () => {
      return { width: 2200, height: 1702 };
    });
    const first = await imageFile.read(pngFile("first.png"));
    const revoked: string[] = [];
    const originalRevoke = URL.revokeObjectURL.bind(URL);
    URL.revokeObjectURL = (url) => {
      revoked.push(String(url));
      originalRevoke(url);
    };

    try {
      await imageFile.read(pngFile("second.png"));
    } finally {
      URL.revokeObjectURL = originalRevoke;
    }

    expect(revoked.includes(first.href)).toBe(true);
  });

  it("revokes the new blob URL when the image cannot be read", async () => {
    const imageFile = new ReferenceImageFile(async () => {
      throw new Error("bad image");
    });
    const revoked: string[] = [];
    const originalRevoke = URL.revokeObjectURL.bind(URL);
    URL.revokeObjectURL = (url) => {
      revoked.push(String(url));
      originalRevoke(url);
    };

    let failed = false;
    try {
      await imageFile.read(pngFile("bad.png"));
    } catch {
      failed = true;
    } finally {
      URL.revokeObjectURL = originalRevoke;
    }

    expect(failed).toBe(true);
    expect(revoked.length > 0).toBe(true);
    expect(revoked[0]?.startsWith("blob:")).toBe(true);
  });
});

function pngFile(name: string): File {
  return new File([new Uint8Array([137, 80, 78, 71])], name, {
    type: "image/png",
  });
}
