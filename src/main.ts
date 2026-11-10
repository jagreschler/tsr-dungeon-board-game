import "./style.css";
import { dungeonBoard } from "./board/dungeon-board.ts";
import { dungeonLayout } from "./board/dungeon-layout.ts";
import { heroPiece } from "./hero-piece.ts";
import { PlayDungeon } from "./play-dungeon.ts";

const app = document.querySelector("#app");

if (!(app instanceof HTMLElement)) {
  throw new Error("Dungeon! is missing its #app element.");
}

const title = document.createElement("h1");
title.className = "title";
title.textContent = "Dungeon!";
app.append(title);

app.append(new PlayDungeon(dungeonBoard, dungeonLayout, heroPiece).element());

const appVersion = document.createElement("p");
appVersion.className = "app-version";
appVersion.textContent = `v${__APP_VERSION__}`;
document.body.append(appVersion);
