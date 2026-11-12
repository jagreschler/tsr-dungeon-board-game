import "./style.css";
import { dungeonBoard } from "./board/dungeon-board.ts";
import { dungeonLayout } from "./board/dungeon-layout.ts";
import { DebugMode } from "./debug-tools/debug-mode.ts";
import { DebugTools } from "./debug-tools/debug-tools.ts";
import { heroPiece } from "./pieces/hero-piece.ts";
import { DungeonSession } from "./dungeon-session.ts";
import { placeBoard } from "./place-board.ts";

const app = document.querySelector("#app");

if (!(app instanceof HTMLElement)) {
  throw new Error("Dungeon! is missing its #app element.");
}

const title = document.createElement("h1");
title.className = "title";
title.textContent = "Dungeon!";
app.append(title);

const session = new DungeonSession(dungeonBoard, dungeonLayout, heroPiece);
const debugMode = new DebugMode(window.location.search, import.meta.env.DEV);
if (debugMode.isOn()) {
  new DebugTools(debugMode).listen(session);
}
placeBoard(app, session);

const appVersion = document.createElement("p");
appVersion.className = "app-version";
appVersion.textContent = `v${__APP_VERSION__}`;
document.body.append(appVersion);
