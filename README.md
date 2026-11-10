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
