import { defineConfig } from "vite";
import { readAppVersion } from "./appVersion.ts";

const appVersion = readAppVersion();

// GitHub Pages project site: https://<user>.github.io/tsr-dungeon-board-game/
export default defineConfig({
  base: "/tsr-dungeon-board-game/",
  define: {
    __APP_VERSION__: JSON.stringify(appVersion),
  },
});
