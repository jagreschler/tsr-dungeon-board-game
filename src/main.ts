import "./style.css";
import { dungeonBoard } from "./board/dungeon-board.ts";
import { dungeonLayout } from "./board/dungeon-layout.ts";
import { MonsterCardPreviewListener } from "./cards/monster-card-preview-listener.ts";
import { DebugMode } from "./debug-tools/debug-mode.ts";
import { DebugOverlayListener } from "./debug-tools/debug-overlay-listener.ts";
import { ReferenceImagePicker } from "./debug-tools/reference-image-picker.ts";
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
const debugOn = debugMode.isOn();
if (debugOn) {
  new DebugOverlayListener(debugMode).listenForOverlayDrawn(session);
  new MonsterCardPreviewListener().listenForOverlayDrawn(session);
}
const board = session.element();
app.append(board);
if (debugOn) {
  new ReferenceImagePicker(board).place();
}

const appVersion = document.createElement("p");
appVersion.className = "app-version";
appVersion.textContent = `v${__APP_VERSION__}`;
document.body.append(appVersion);
