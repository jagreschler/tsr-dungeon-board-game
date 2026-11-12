import "./style.css";
import { dungeonBoard } from "./board/dungeon-board.ts";
import { dungeonLayout } from "./board/dungeon-layout.ts";
import { MonsterCardPreviewListener } from "./cards/monster-card-preview-listener.ts";
import { DebugMode } from "./debug-tools/debug-mode.ts";
import { DebugOverlayListener } from "./debug-tools/debug-overlay-listener.ts";
import { heroPiece } from "./pieces/hero-piece.ts";
import { DungeonSession } from "./dungeon-session.ts";

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
  new DebugOverlayListener(debugMode).listenForOverlayDrawn(session);
}
if (import.meta.env.DEV) {
  new MonsterCardPreviewListener().listenForOverlayDrawn(session);
}
app.append(session.element());

const appVersion = document.createElement("p");
appVersion.className = "app-version";
appVersion.textContent = `v${__APP_VERSION__}`;
document.body.append(appVersion);
