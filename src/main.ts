import "./style.css";
import { level1Board } from "./board/level-1-board.ts";
import { level1Layout } from "./board/level-1-layout.ts";
import { GenerateBoard } from "./generate-board.ts";

const app = document.querySelector("#app");

if (!(app instanceof HTMLElement)) {
  throw new Error("Dungeon! is missing its #app element.");
}

const title = document.createElement("h1");
title.className = "title";
title.textContent = "Dungeon!";
app.append(title);

const boardDrawing = new GenerateBoard(level1Board, level1Layout);
app.append(boardDrawing.svg());

const appVersion = document.createElement("p");
appVersion.className = "app-version";
appVersion.textContent = `v${__APP_VERSION__}`;
document.body.append(appVersion);
