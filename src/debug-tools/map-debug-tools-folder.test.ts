import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { DebugMode } from "./debug-mode.ts";

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
  "debug-overlay-listener.ts",
  "debug-overlay-listener.test.ts",
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
    const main = readFileSync(resolve("src/main.ts"), "utf8");

    expect(session.includes("debug-tools")).toBe(false);
    expect(session.includes("import.meta.env")).toBe(false);
    expect(session.includes("bind-monster-card-preview")).toBe(false);
    expect(main.includes("DebugOverlayListener")).toBe(true);
    expect(main.includes("MonsterCardPreviewListener")).toBe(true);
    expect(existsSync(resolve("src/cards/bind-monster-card-preview.ts"))).toBe(
      true,
    );
  });

  it("wires the card preview listener from debugMode.isOn(), including live ?debug", () => {
    const main = readFileSync(resolve("src/main.ts"), "utf8");
    const debugBlock = main.slice(
      main.indexOf("if (debugMode.isOn())"),
      main.indexOf("app.append(session.element())"),
    );

    expect((main.match(/import\.meta\.env\.DEV/g) ?? []).length).toBe(1);
    expect(main.includes("if (import.meta.env.DEV)")).toBe(false);
    expect(debugBlock.includes("MonsterCardPreviewListener")).toBe(true);
    expect(new DebugMode("?debug", false).isOn()).toBe(true);
  });
});
