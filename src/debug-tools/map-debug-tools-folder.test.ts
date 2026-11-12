import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const debugToolsFolder = resolve("src/debug-tools");
const renderingFolder = resolve("src/rendering");

const mapDebugModules = [
  "append-move-step-labels.ts",
  "append-move-step-labels.test.ts",
  "append-reference-overlay.ts",
  "append-stored-link-marks.ts",
  "append-stored-link-marks.test.ts",
  "append-stored-link-marks-door-wall.test.ts",
  "bind-move-step-labels.ts",
  "bind-move-step-labels.test.ts",
  "bind-reference-overlay.ts",
  "bind-reference-overlay.test.ts",
  "bind-stored-link-marks.ts",
  "bind-stored-link-marks.test.ts",
  "debug-mode.ts",
  "debug-mode.test.ts",
  "read-reference-board-luminance.ts",
  "stored-door-mark-ends.ts",
  "stored-door-mark-ink-gaps.ts",
] as const;

describe("map debug tools folder", () => {
  it("keeps every map debug module under src/debug-tools/", () => {
    for (const fileName of mapDebugModules) {
      expect(existsSync(resolve(debugToolsFolder, fileName))).toBe(true);
      expect(existsSync(resolve(renderingFolder, fileName))).toBe(false);
    }
  });

  it("binds B, L, and D from that folder, and leaves G/H/R in cards", () => {
    const session = readFileSync(resolve("src/dungeon-session.ts"), "utf8");

    expect(session.includes("./debug-tools/bind-reference-overlay.ts")).toBe(
      true,
    );
    expect(session.includes("./debug-tools/bind-stored-link-marks.ts")).toBe(
      true,
    );
    expect(session.includes("./debug-tools/bind-move-step-labels.ts")).toBe(
      true,
    );
    expect(session.includes("./cards/bind-monster-card-preview.ts")).toBe(true);
    expect(session.includes("./rendering/bind-reference-overlay.ts")).toBe(
      false,
    );
    expect(session.includes("./rendering/bind-stored-link-marks.ts")).toBe(
      false,
    );
    expect(session.includes("./rendering/bind-move-step-labels.ts")).toBe(false);
    expect(existsSync(resolve("src/cards/bind-monster-card-preview.ts"))).toBe(
      true,
    );
  });
});
