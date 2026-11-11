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
  same rectangles read tan. The fan line drawing shows nine inner-ring rooms
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
- **Secret doors.** The fan line drawing marks `S` on the west hall, the
  southwest cluster, and east of Start. The 1981 photo's left third is
  covered by the rules sheet, and dashed white secret doors are hard to
  see at this resolution. The three secret doors in data follow that
  drawing and still need a photo check.
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

## DUN-5-1 — Traced space records (10 Nov 2026)

The 1981 board will be one list of traced spaces, not a Level 1 sketch.
This slice adds the record types, a four-point box outline helper, and
`printedName` on `Space` so later slices can name the Main Staircase and
the named chambers. The trace list starts empty.

## DUN-5-2 — Start, stairs, and named chambers (10 Nov 2026)

The 1981 board names 13 chambers plus the Main Staircase. This slice adds
those traces so later rooms and corridors can attach to real identifiers.
The Main Staircase is the start. The Main Gallery is safe.

## DUN-5-3 — Numbered rooms by zone (10 Nov 2026)

Numbered rooms fill the six color zones. Counts follow the 1981 board:
9, 9, 16, 18, 16, and 12. Named chambers stay on their own traces.

## DUN-5-4 — Corridor traces (10 Nov 2026)

Corridors fill the halls between rooms. This slice adds 353 corridor
traces so later connections can name both ends.

## DUN-5-5 — Open hallway connections (10 Nov 2026)

Open hallways join the traces into one board. The old Level 1 sketch
files go away. A hero can already walk the Main Staircase into the Main
Gallery. Doors and secret doors come next.

## DUN-5-6 — Doors and secret doors (10 Nov 2026)

Ordinary doors join rooms to halls. Secret doors block a hero until the
party has found them. Connection kind still lives on the link, not on
the space.

## DUN-5-7 — Draw the traced board (10 Nov 2026)

The app now draws one SVG of the whole 1981 board. Rooms and chambers
use four-point box outlines until the next slice traces real walls.
`main.ts` only mounts the title and that SVG.

## DUN-5-8 — Real wall outlines (10 Nov 2026)

Named chambers and numbered rooms now use traced wall polygons instead
of four-point boxes. Corridors stay as boxes. The GenerateBoard outline
test still requires at least four points, and the drawn rooms follow
the 1981 walls.

## DUN-5-8 — Guard wall outlines with a reference test (10 Nov 2026)

Chamber and room wall outlines are hand-traced numbers, so this test
keeps a snapshot of every outline and fails by name if any coordinate
changes. An intentional retrace updates the snapshot on purpose with
`npx vitest run -u`. The same test checks that each outline has at
least three points, every point sits inside the 2200×1702 reference
  tracing image, and the outline stays close to that space's traced box.
The four earlier tests were dropped only to match PR 4 byte-for-byte,
and they still guard the room counts, corridor count, named chambers,
and trace basics.

## DUN-5 — One flat board and tracing sources (10 Nov 2026)

The 1981 board is one flat map, not six stacked floors. The game draws
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

- Fan-made line drawing of the classic board, rotated 90° clockwise, for
  corridor squares, room outlines, and `S` secret-door marks
- Wayne's Books 1975 photo for printed chamber names and overall geometry
- BGG pic950059 for zooming labels and doors
- BGG pic756723 (1981 board, left third covered) for zone colors: gold,
  green, orange, magenta, red, blue

Room counts per zone follow Zenopus's treasure-card / room inventory
(9 / 9 / 16 / 18 / 16 / 12) plus Jason's 13 named chambers with **4 on
level 5**.

## DUN-6 — Doors sit on the room wall, not the staircase (10 Nov 2026)

Four gold rooms around the Main Staircase had their doors wired straight
to Start, so the door dots sat on the circle. Each of those doors now
opens onto the short corridor stub in front of the room; the stub stays
an open step from the staircase, so a hero can still reach every gold
room from Start without finding a secret door. Ordinary door markers are
drawn on the room wall that faces the neighbor, not halfway between
space centers. Secret doors stay hidden until found.

## DUN-7 — A Hero piece sits on the Main Staircase (10 Nov 2026)

A piece is a small game-agnostic record: who it is, what kind of piece
it is, and which space it sits on. That shape can later hold Clue pawns
as easily as Dungeon! classes. This slice adds one piece, the 1981
Hero, on the Main Staircase when the board loads, and draws it as a
token at that space's center. There is no movement yet.

## DUN-9 — The Hero may move up to five spaces (10 Nov 2026)

A pawn moves 0 to 5 spaces on a turn; dice are not used for movement.
Each corridor, stair, room, or chamber counts as one space. Doors and
secret doors do not add a space. Secret doors stay blocked until found
(nothing is found yet). Entering a room or any chamber other than the
Main Gallery ends the move there. The Main Staircase and Main Gallery
can be walked through. Pawns may not land on another pawn except at
Start or in a chamber.

The search itself is game-agnostic: a board graph, a start space, a
step limit, and rules for blocked and stopping spaces. Dungeon! passes
those rules in. Reachable spaces (1 to 5 steps away) glow green. Clicking
a glow moves the Hero and the glow recomputes. No turns, dice, or
monsters yet.

## DUN-9 — One class per kind of move highlight (10 Nov 2026)

The green glow used three shapes in one function: a circle for the Main
Staircase, a polygon for traced walls, and a box for corridors. Each
shape is now its own small Generate class, and they share the glow
paint. That is easier to read and easier to extend if another highlight
shape shows up later. The board still looks the same.

## DUN-9 — DungeonSession, not PlayDungeon (10 Nov 2026)

The class that holds the live board, Hero, and glow was named
`PlayDungeon`. Class names for nouns must not use words that can also
be verbs, and "Play" is a verb. It is now `DungeonSession`. The glow
and the click-to-move behavior are unchanged.

## DUN-8 — Source files live in a few named folders (10 Nov 2026)

The `src/` root had become a flat pile of drawing, movement, and piece
files next to `main.ts`. They now sit in folders by what they are:

- `src/board/` — the board graph, spaces, and layout
- `src/board/map-data/` — traced map data, grouped by kind (corridors,
  rooms, open links, door links, secret-door links, chambers, outlines).
  `dungeon-traces.ts` and `board-links.ts` stay at the map-data root
  because they gather those groups
- `src/rendering/` — Generate classes and SVG helpers that draw the board
- `src/movement/` — which spaces a hero can step to, reachability, and
  the 1981 move rules
- `src/pieces/` — the generic piece record and the Hero

`main.ts`, `dungeon-session.ts`, and `style.css` stay at the root.
Pieces, movement, and rendering stay reusable for a later Clue game.
Nothing about how the game plays changed; only import paths moved.

## DUN-10 — Hover names for each space, and a local tracing overlay (11 Nov 2026)

Jason could not tell which numbered room was which. Every space now has an
SVG `<title>` so the browser shows a native tooltip on hover, like "Room 3-14,
level 3". Named chambers keep their printed name ("Storeroom, level 3"). The
green move glows carry the same title, because they sit on top of the spaces
and would otherwise hide the tooltip. `describeSpace` is the one function that
builds that sentence.

A local-only overlay of a fan-made line drawing of the classic board can be
toggled with the B key during `npm run dev`, so traces can be checked against
the source image.
The PNG stays out of the repo: it is a reference copy, not for redistribution,
and this site is public. Drop it in gitignored `local-reference/` if you have
it. The overlay is off by default, does nothing if the file is missing, and
is stripped from the production build. Trace coordinates already match the
image pixels (0,0 origin, 2200×1702), so the overlay is drawn at that size
with no extra offset or scale.

The overlay's black ink disappeared against the near-black board floor, so a
solid gray `#808080` rectangle now sits under the PNG (same 2200×1702 box,
same B-key toggle). The green move glow also washed out the line art, so
while the overlay is on the board sets `data-reference-overlay-visible` and CSS
drops the glow fill to 0.1 alpha and the stroke to 1px. Turning the overlay
off restores the normal glow. The highlight shapes are not clipped to
corridor outlines; that idea is deferred.

## DUN-10 — Reference overlay, not a personal name (11 Nov 2026)

Jason asked to keep personal names out of the code. Files, functions, CSS
hooks, the local PNG filename, and these notes now say "reference overlay"
and "fan-made line drawing of the classic board". The tracing credit stays;
only the personal name went away. Nothing about how the overlay works
changed.

## DUN-10 — Lighter stone floor (11 Nov 2026)

The board floor was near-black `#1a1410`, which made gaps between spaces
hard to read as stone. It is now `#3a2e24`, a lighter brown that still
reads as dark stone. The SVG floor rect and the `.dungeon-board`
background use that same color. Chamber labels, door dots, and space ink
were left alone.

## Open: map data gaps (10 Nov 2026)

**Open — not resolved.** To do: find and fix any spaces, doors, or
connections missing from the map data compared to the 1981 reference
sources. The corridor-1116-162 case is fixed. Level 4 sure items from
the map-data audit are fixed (see the 11 Nov 2026 DUN-12 note below).
Keep looking for other missing squares, doors, and links; later levels
and the level 4 "likely" items are still open. Remaining cut-off spaces
are named in the DUN-13 reachability list, which should shrink as those
fixes land.

## DUN-11 — corridor-1116-162 continues south through a secret door (11 Nov 2026)

The magenta hall east of the Crypt used to dead-end at
`corridor-1116-162`. The fan line drawing (1:1 with the trace
coordinates) and the BGG board photo both show that run continuing
straight down: one more corridor square, a secret door drawn across the
hall, then one more square that joins `corridor-1124-318`.

Boxes measured from the line drawing:

- `corridor-1116-212` — level 4, x1095 y189 w43 h47 — open from
  `corridor-1116-162`
- `corridor-1124-272` — level 4, x1102 y252 w44 h41 — open into
  `corridor-1124-318`
- those two squares join with a `secretDoor` link, hidden until found

Secret-door data was only room-or-chamber to corridor before this, but
the link tuple and movement code already treat any two spaces the same
way, so this corridor-to-corridor door needed no extra handling. The
corridor count is now 355. Other map gaps stay open.

## DUN-12 — Level 4 sure map-data gaps (11 Nov 2026)

Jason asked to fix the map-data audit one color zone at a time, sure
items first. This slice is level 4 only. The corridor-1116-162 column
was already fixed on DUN-11 and is not repeated here. Every item was
checked against the 1:1 line drawing; none of the sure items had to be
dropped.

Under room-4-02 the vertical hall has S marks between
`corridor-1244-256`, `corridor-1244-318`, and `corridor-1244-381`. Those
two joins are secret doors now, not open halls. The drawing also shows
thick walls between `corridor-1296-313` and the upper and lower squares,
so the diagonal open links that skipped around the S marks are gone. The
real east-west join into `corridor-1244-318` stays open.

Also added, all as drawn:

- secret door: room-4-06 to corridor-887-972
- open: Torture Chamber to corridor-1155-1317
- doors: room-4-09 to corridor-949-1298, room-4-10 to
  corridor-1122-1246, room-4-12 to corridor-815-1426, room-4-13 to
  corridor-889-1441, room-4-14 to corridor-1300-1523, room-4-17 to
  corridor-713-1517, room-4-18 to corridor-2044-1485

Level 4 "likely" items (folded squares, room-to-room gray gaps, the
room-4-07 / room-4-08 secret marks) stay for a later pass.

## DUN-12 — Map-gap tests live in one file (11 Nov 2026)

Map-gap checks now sit together in `src/board/map-gaps.test.ts`, one
describe block per fix, so they do not scatter into one file per level.

## DUN-12 — Drop the hard-coded level 4 pair checks (11 Nov 2026)

The level 4 sure-gap tests named each from/to pair in code. Those IDs
are hard to read, and the real check is whether a hero can reach the
spaces, which the reachability test covers. The pair checks are gone.
Door, secret-door, and open kinds, and the removed diagonal shortcuts,
are now checked only by eye against the reference drawing.

## DUN-13 — Map reachability from the Main Staircase (11 Nov 2026)

Jason wanted a test that walks the whole board from the Main Staircase
and fails if any space is cut off. Open halls, ordinary doors, and
secret doors all count, because a secret door can be found. The walk
reuses the existing neighbor helper and graph search, with no extra
step limit and without stopping in rooms.

Some spaces are still unreachable (no links at all, or sitting in a
component that does not yet join Start). Those identifiers live in an
explicit named list. The test fails if a space is unreachable and not
on the list, or if a listed space becomes reachable. The list can only
shrink as later map-data fixes land. The goal is an empty list.

## DUN-14 — First reachability fix: room-3-11 east door (11 Nov 2026)

room-3-11 already had its west door into `corridor-478-1032`, but that
whole west corridor run was cut off from Start. The 1981 line drawing
shows a second door tab on the east wall, into `corridor-654-1072`,
which is already on the reachable graph. Adding that one ordinary door
lets a hero walk into the room from the east and out through the west
door, so the 14 spaces in that cluster drop off the known-unreachable
list (125 → 111). Other listed gaps stay for later passes.

## DUN-15 — Version badge keeps its dots (11 Nov 2026)

The corner badge is `v` plus the `package.json` version, the same
string Afterlight uses. The live page already had `v0.1.0` in the DOM,
but the parchment color was only 55% opaque, so the periods vanished
and the badge read as `010`. The label is now a stronger tan, a little
larger, and tabular numerals. A page test checks the full `v0.2.0`
string, including the dots.

## DUN-15 — Tag the version on main (11 Nov 2026)

Afterlight tags each version bump on the merge commit after it lands
on main. That tag was created by hand. Dungeon! already created a
GitHub Release when a `v*` tag was pushed, but nothing made the tag.

A workflow on push to main reads `package.json` and, if `v<version>`
does not exist yet, runs the same `gh release create --generate-notes`
command as the tag workflow. That creates the tag and the release
together. GitHub will not start another workflow from a tag written
with `GITHUB_TOKEN`, so this job does not rely on the tag-push
workflow to fire. Tags pushed from outside Actions still use that
existing workflow.

No tag is created on this branch. The first tag, `v0.2.0`, is made
when this change merges to main.

## DUN-16 — Four sure Level 5–6 links (11 Nov 2026)

The line drawing shows door tabs on room-5-01 south into
`corridor-1458-213`, room-5-04 east into `corridor-1991-179`, and
room-6-08 east into `corridor-1817-781`. Wizard's Treasure Room also
opens east into the unlinked square `corridor-1880-295` (no door tab;
the chamber wall is open there). Those four links were on the
reachability shortlist and look unambiguous.

Adding them lets a hero reach 11 more spaces, so the known-unreachable
list goes from 111 to 100. Other listed gaps stay for later passes.

## DUN-17 — No open hall through the gold/magenta wall (11 Nov 2026)

A hero on `corridor-1068-485` (level 1, gold) could highlight
`corridor-1053-429` (level 4, magenta) in one turn. Movement only
walks recorded connections; it does not invent grid neighbors. The
1981 drawing has a wall between those halls. Five `open` links in
`board-open-links-1.ts` crossed that wall: 1053-429 to 1068-485 and
to 1016-486, 999-432 to 1016-486, 1122-456 to 1053-429, and 1122-417
to 1122-456. Those tuples are gone. Same-level joins on each side of
the wall stay. The known-unreachable list is unchanged (100).
