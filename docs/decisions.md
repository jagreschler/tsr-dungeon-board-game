# Decisions

Short log of choices for this project.

## 2026-11-10 — Vite, TypeScript, and Vitest

The site is a static browser page, the same kind of app as Afterlight. This repo uses that project's setup: Vite, plain TypeScript, and Vitest, with Node 22. There is no UI framework and no server. CI typechecks, runs the tests, and also runs the production build. Afterlight's CI stops after the tests.

## 2026-11-10 — GitHub Pages base path

The built site is a GitHub Pages project site at `/tsr-dungeon-board-game/`. Vite's `base` is that path so asset URLs resolve under the project path instead of the domain root.

## 2026-11-10 — Pages source still needs a manual setting

The deploy workflow publishes on push to `main`, but it cannot turn Pages on. The owner still has to open the repository settings, choose Pages, and set Source to GitHub Actions. That setting is not changed here.

## 2026-11-10 — 1981 TSR edition

The game follows the 1981 TSR edition. The classes are Superhero, Hero, Elf, and Wizard, and the card list is that edition's. Later Wizards of the Coast wording, including the 2012 classes and the Great Hall, is not the rule set.

## 2026-11-10 — One module reads the version

The version lives in `package.json`. `appVersion.ts` is the only module that reads it. The Vite config and the Vitest config both import that module, so the two configs cannot drift.

## 2026-11-10 — A version tag opens a GitHub Release

GitHub has no built-in setting to create a release when a tag is pushed. Pushing a `v` tag, such as `v0.1.0`, runs a workflow that creates a GitHub Release with auto-generated notes. No tag is created until a version is ready to release.
