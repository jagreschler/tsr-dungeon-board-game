import { describe, expect, it } from "vitest";
import { DebugMode } from "./debug-mode.ts";

describe("DebugMode", () => {
  it("is off when the address has no debug flag", () => {
    const mode = new DebugMode("");

    expect(mode.isOn()).toBe(false);
    expect(mode.hasLinks()).toBe(false);
    expect(mode.hasSteps()).toBe(false);
  });

  it("is on for ?debug, with overlays still off until named", () => {
    const mode = new DebugMode("?debug");

    expect(mode.isOn()).toBe(true);
    expect(mode.hasLinks()).toBe(false);
    expect(mode.hasSteps()).toBe(false);
  });

  it("turns on the L overlay for debugOptions=links", () => {
    const mode = new DebugMode("?debug&debugOptions=links");

    expect(mode.isOn()).toBe(true);
    expect(mode.hasLinks()).toBe(true);
    expect(mode.hasSteps()).toBe(false);
  });

  it("turns on the D overlay for debugOptions=steps", () => {
    const mode = new DebugMode("?debug&debugOptions=steps");

    expect(mode.hasLinks()).toBe(false);
    expect(mode.hasSteps()).toBe(true);
  });

  it("turns on both for debugOptions=links,steps", () => {
    const mode = new DebugMode("?debug&debugOptions=links,steps");

    expect(mode.hasLinks()).toBe(true);
    expect(mode.hasSteps()).toBe(true);
  });

  it("ignores debugOptions when ?debug is missing", () => {
    const mode = new DebugMode("?debugOptions=links,steps");

    expect(mode.isOn()).toBe(false);
    expect(mode.hasLinks()).toBe(false);
    expect(mode.hasSteps()).toBe(false);
  });

  it("ignores unknown options and extra spaces", () => {
    const mode = new DebugMode("?debug&debugOptions= links , mystery,steps ");

    expect(mode.hasLinks()).toBe(true);
    expect(mode.hasSteps()).toBe(true);
  });
});
