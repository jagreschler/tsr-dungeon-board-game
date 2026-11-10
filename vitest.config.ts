import { defineConfig } from "vitest/config";
import { readAppVersion } from "./appVersion.ts";

const appVersion = readAppVersion();

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(appVersion),
  },
  test: {
    environment: "happy-dom",
  },
});
