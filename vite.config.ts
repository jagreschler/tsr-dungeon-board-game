import fs from "node:fs";
import path from "node:path";
import { defineConfig, type Plugin } from "vite";
import { readAppVersion } from "./appVersion.ts";

const appVersion = readAppVersion();
const LOCAL_REFERENCE_PREFIX = "/tsr-dungeon-board-game/local-reference/";

function serveLocalReference(): Plugin {
  return {
    name: "serve-local-reference",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url ?? "";
        if (url.startsWith(LOCAL_REFERENCE_PREFIX) === false) {
          next();
          return;
        }

        const fileName = decodeURIComponent(
          url.slice(LOCAL_REFERENCE_PREFIX.length).split("?")[0] ?? "",
        );
        if (
          fileName === "" ||
          fileName.includes("/") ||
          fileName.includes("\\") ||
          fileName.includes("..")
        ) {
          res.statusCode = 404;
          res.end();
          return;
        }

        const filePath = path.resolve("local-reference", fileName);
        if (fs.existsSync(filePath) === false) {
          res.statusCode = 404;
          res.end();
          return;
        }

        res.setHeader("Content-Type", "image/png");
        res.end(fs.readFileSync(filePath));
      });
    },
  };
}

// GitHub Pages project site: https://<user>.github.io/tsr-dungeon-board-game/
export default defineConfig({
  base: "/tsr-dungeon-board-game/",
  define: {
    __APP_VERSION__: JSON.stringify(appVersion),
  },
  plugins: [serveLocalReference()],
});
