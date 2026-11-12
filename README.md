# Dungeon!

Browser version of TSR's Dungeon! board game, 1981 edition, hot-seat, static site.

## Requirements

Node.js 22 (see `.nvmrc`).

## Run

```bash
npm ci
npm run dev
```

Vite serves the app under `/tsr-dungeon-board-game/`, the same path GitHub Pages will use. Open the local URL it prints.

### Local reference overlay

The rooms were traced from a fan-made line drawing of the classic board. That image is a reference copy, not for redistribution, so it is not in this public repo.

To line the drawing up with the traced spaces while working locally:

1. Create a `local-reference/` folder at the repo root (gitignored).
2. Save the map as `local-reference/reference-board-map.png` (2200×1702, the standard board orientation).
3. Run `npm run dev` and press **B** to show the drawing at 50% opacity. Press **B** again to hide it.

The overlay is off by default. If the file is missing, the key does nothing. The production build never includes or references the image.

### Local stored-link overlay

In `npm run dev` only, press **L** to draw every stored board link once: open halls in bright green from center to center, ordinary doors in yellow from the hall square to the printed ink gap in the room wall, secret doors in purple dashes the same way. Press **L** again to hide it. Works with **B** and **D**. Production builds do not bind this key.

### Local monster card preview

Entering an occupied Level 1 (gold) room draws a monster from that level's deck. In `npm run dev` only, press **G** to preview Goblins, **H** for Hobgoblins, or **R** for Giant Rats. Press **Shift+G**, **Shift+H**, **Shift+R**, or **Shift+L** to skip the clip and show the card only (Giant Lizard is Shift+L, because **L** is the stored-link overlay). Production builds do not bind these keys.

## Test

```bash
npm test
```

## Typecheck

```bash
npm run typecheck
```

## Build

```bash
npm run build
```

The static site is written to `dist/`. Preview that build with `npm run preview`.

## GitHub Pages

Pushes to `main` build the site and deploy it with the "Deploy GitHub Pages" workflow. In the repository settings, open **Pages** and set the source to **GitHub Actions**. The owner still needs to turn that source on. The site is a project page, so the public URL ends in `/tsr-dungeon-board-game/`.

Why the stack looks like this: [docs/decisions.md](docs/decisions.md).

## Glossary

Domain acronyms used in this project.

| Term | Meaning |
| --- | --- |
| TSR | Tactical Studies Rules, the publisher of the 1981 Dungeon! board game. |
