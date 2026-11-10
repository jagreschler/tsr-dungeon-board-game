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

## DUN-2 — Board as typed data, Level 1 first (10 Nov 2026)

The 1981 board is captured as plain TypeScript objects in `src/board/`, not as
drawn UI. Spaces, doorways, and adjacencies are data. Future turns can walk
that graph without scraping the DOM.

Level 1 (gold) is first because it holds the Main Staircase (start) and the
Main Gallery (the safe chamber). Every game begins there, so the graph has to
be right before later levels can attach.

Jason decided on 9 Nov 2026 that Level 5 has **4 chambers**, not 2. Zenopus
Archives' inventory table lists 2 chambers on Level 5 and 11 chambers in
total. Counting the named chambers on the 1975/1981 layout (Main Gallery,
Kitchen, Council Room, Armory, Crypt, Storeroom, Torture Chamber, King's
Library, King's Treasure Room, Queen's Treasure Room, Queen's Treasure Room
Annex, Wizard's Laboratory, Wizard's Treasure Room) gives 13. With Level 1
having 1 chamber and Levels 2–4 and 6 having 2 each, Level 5 must have 4 to
match those names. Later PRs should use 4 chambers on Level 5.

Room identifiers on Level 1 are stable position ids (`level-1-room-north`,
and so on). The 1981 board does not print names on those gold rooms, so this
PR does not invent any.

### TODOs (unreadability, not guesses)

- **Inner-ring gold vs orange/green.** On the 1981 photo the rooms around
  Start read orange or green under warm light; on the 1975 photo some of the
  same rectangles read tan. Jasper's line art shows nine inner-ring rooms
  around the Main Staircase. This PR treats that inner ring as the nine
  Level 1 rooms. Confirm each fill against a flatter 1981 scan when one is
  available.
- **Corridor square counts.** Flagstone squares on the long west spoke and
  on corridors that leave Level 1 toward Crypt / Torture Chamber / King's
  Library are too small to census from the attached photos. Only the inner
  spokes needed to reach the nine rooms are in the data. Outer squares are
  omitted until they can be counted on a higher-resolution board.
- **Stair destinations.** The 1981 rules sheet diagram labels stairs near
  the Main Gallery as going down to Level 4. Rounded stair spaces on the
  west and southwest spokes are recorded with `destinationLevel: 4`. Other
  rounded stairs on Level 1 corridors are not in this PR; their destinations
  were not readable.
- **Secret doors.** Jasper marks `S` on the west hall, the southwest cluster,
  and east of Start. The 1981 photo's left third is covered by the rules
  sheet, and dashed white secret doors are hard to see at this resolution.
  The three secret doors in data follow Jasper and still need a photo check.
- **Main Staircase vs Main Gallery.** Both labels sit on the central circle.
  This PR models them as two adjacent spaces (start vs safe chamber) so later
  rules can treat "return to Start" and "no monsters in the Main Gallery"
  separately. Confirm whether a pawn occupies one circle or two.

## DUN-2 — Door kind lives on the connection (10 Nov 2026)

Doorways used to be a second list beside connections. Secret doors then
either copied an open hallway (so a hero walked through without finding
them) or had no hallway at all (so they could never be used). Each link
between two spaces is now one connection whose kind is open, door, or
secret door. Movement reads that kind: a secret door is closed until the
party has found it. The old "connections are always symmetric" check went
away because `buildBoard` already writes the reverse link. Unused
`isLevel`, `MINIMUM_LEVEL`, and `MAXIMUM_LEVEL` were deleted; the `Level`
type stays because spaces still use it.

## DUN-4 — Draw Level 1 as SVG (10 Nov 2026)

The board graph still has no real map coordinates. Level 1 spaces now have a
separate grid layout (`level-1-layout.ts`) so drawing does not live on the
space records. `GenerateBoard` turns that layout into an SVG: gold rooms,
gray corridor squares, a circle for the Main Staircase, a rounded rectangle
for the Main Gallery, step marks on stairs, and a marker for ordinary doors.
Secret doors stay hidden because they have not been found. The grid is a
rough sketch of the inner ring around Start. Align it to the 1981 board in a
later PR.

## DUN-5 — One traced 1981 board (10 Nov 2026)

The 1981 board is one flat map, not six stacked floors. This branch draws
that single map. `level` on each space is only the colored zone (1–6) the
rules use for monster/treasure decks and hero depth limits. File names,
exports, tests, the SVG label, and new docs headings say "board" / "dungeon
board", not "Level 1". Unnamed rooms dropped the `level-1-room-*` ids
(`room-north`, `room-east`, and so on).

The start space is the **Main Staircase**. The safe chamber is the **Main
Gallery**. Classes stay Superhero, Hero, Elf, and Wizard. A scan of this
branch found no 2012 terms (Great Hall, Fighter, Rogue, Cleric) in code to
rename; tests now reject "Great Hall" in the UI and printed names.

Traced from (downloaded to `/tmp` only; not committed — the photos are
copyrighted):

- Jasper line art, rotated 90° clockwise, for corridor squares, room
  outlines, and `S` secret-door marks
- Wayne's Books 1975 photo for printed chamber names and overall geometry
- BGG pic950059 for zooming labels and doors
- BGG pic756723 (1981 board, left third covered) for zone colors: gold,
  green, orange, magenta, red, blue

Room counts per zone follow Zenopus's treasure-card / room inventory
(9 / 9 / 16 / 18 / 16 / 12) plus Jason's 13 named chambers with **4 on
level 5**.

### Approximate or still unread

- Armory, Crypt, and Storeroom are irregular on the board; they are bounding
  rectangles. Wizard's Laboratory and King's Library are triangles.
- Kitchen and the Queen's Treasure Room Annex are circles.
- Main Staircase and Main Gallery still share the central circle: the
  gallery is the lower half so "return to Start" and "no monsters in the
  Main Gallery" can stay two spaces.
- Corridor squares come from white flagstone blobs. Cracks split some
  squares; a few long blobs were cut into pieces. Count is therefore a
  census of those blobs, not a hand count of every printed flagstone.
- One L-shaped blob west of King's Treasure was split into two rooms.
- A few rooms were reassigned across nearby color zones so the Zenopus
  room counts match; the inner gold ring is missing a clean
  `room-southwest` name because that rectangle sat on a color boundary.
- Only the rounded stair west of the Main Staircase is typed as `stairs`
  (destination 4, matching the 1981 diagram). Other rounded landings are
  still corridor squares until they can be read on a flatter 1981 scan.
- Secret doors follow `S` letters on Jasper, not a photo-perfect dashed-wall
  census. The 1981 photo's left third is under the rules sheet.
- Zone colors for the covered left third (Armory / Kitchen / Storeroom)
  follow 1981's palette applied to Wayne's geometry.
