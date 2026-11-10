import "./style.css";
import { dungeonBoard } from "./board/dungeon-board.ts";
import { dungeonLayout } from "./board/dungeon-layout.ts";
import { GenerateBoard } from "./generate-board.ts";

const app = document.querySelector("#app");

if (!(app instanceof HTMLElement)) {
  throw new Error("Dungeon! is missing its #app element.");
}

const title = document.createElement("h1");
title.className = "title";
title.textContent = "Dungeon!";
app.append(title);

const boardDrawing = new GenerateBoard(dungeonBoard, dungeonLayout);
app.append(boardDrawing.svg());

const appVersion = document.createElement("p");
appVersion.className = "app-version";
appVersion.textContent = `v${__APP_VERSION__}`;
document.body.append(appVersion);
