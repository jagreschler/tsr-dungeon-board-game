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

## DUN-18 — First monster card and clip (11 Nov 2026)

This slice adds the Level 1 Goblins card picture and a short mute clip.
The game still cannot draw a monster during a real turn. A local-only
**G** key (Shift+G for the card with no clip) shows the overlay so we
can check the art. Production play does not bind that key.

The lookup builds file names as `L<level>-<monster>` in lowercase
(`L1-goblins.jpg` / `.mp4`). If the monster is unknown, or we have no
clip, the clip is left off and the card can show on its own. The clip
plays first with Skip, then the card sits on a dimmed board with Close.
The blank box on the art gets the name Goblins and the 1981 numbers:
Lightning 6, Fireball 2, Wizard 5, Superhero 2, Hero 4, Elf 3. Monster
cards use a red border. The overlay publishes `CardRevealed` and
`OverlayClosed` so later encounter rules can listen without living
inside the picture code.

## DUN-22 — Drop open-hall skip links near Start (12 Nov 2026)

From Start the five-step glow reached squares that look more than five
printed spaces away. The search itself was fine (cap 5, one step per
space). Open corridor links jumped over a square in between. The
first cut dropped seven tuples near Start. That was not enough: the
glow still used twelve more skip links in the five-step graph,
including `main-staircase`/`1057-974` (via `1098-942`) and
`stairs-west`/`942-774` (via `909-774`). Those twelve are gone too.
The honest neighbor links on each side were already in the data, so
nothing was stranded. Door links stay. Known-unreachable count stays
100.

The first seven: 909-774/986-786, stairs-west/926-664,
1201-1052/1202-1112, 1202-1112/1176-1177, 1202-1112/1204-1177,
1196-1020/1221-1092, and 966-968/887-972.

The twelve that still inflated the Start glow: main-staircase/1057-974,
stairs-west/942-774, 1367-754/1438-716, 1367-754/1433-780,
1408-754/1429-681, 1408-754/1482-762, 1408-754/1433-817,
1429-681/1482-762, 1482-762/1499-850, 1491-803/1512-872,
839-887/916-921, and 1221-1092/1190-1139.

The next cut treated `corridor-1018-1011` as magenta and dropped its
gold neighbors. That was wrong: on the printed board it is the third
gold flagstone on the southwest spoke, mis-tagged as level 4. It is
level 1 again, and the two gold-to-gold opens are back. Honest steps
from Start: 1098-942 (1), 1057-974 (2), 1018-1011 (3), 966-968 (4),
916-921 (5). `room-4-06` is the door off that fourth square.

East of Start the gold hall is honest through 1438-716 and 1433-817.
The three level-6 squares that showed as 5 sat across a wall
(1482-762, 1491-803, 1499-850). Those six gold-to-blue `open` links
are gone. That L6 run has no other path back to Start yet, so it
joins known-unreachable (117). From Start, 37 spaces remain in range.

Local **D** draws the BFS step count on each highlighted space. It is
dev-only, next to **B**.

Two more Start skip links. Start was open to `corridor-1319-730`, the
second northeast square, so that square showed 1 beside `1252-704`.
The west stub `1045-800` was open to `1011-741`, the north bump that
sits on `986-786`, so those two showed 2 beside 2. Those tuples are
gone. `1011-741` is three.

An open hall is only a real step if the two printed squares share an
edge on the B overlay (ink outlines touching, or a few pixels of ink).
Gray floor between them is a skip. 34 `open` tuples had a gray gap of
3px or more; those are gone. Door links were not touched. No new
links were added. A checked-in list of those 34 pairs keeps them from
coming back.

The biggest cut was Start to `corridor-1252-704` (25.6px of gray).
That square still joins `1319-730` and the gold rooms on the northeast
spoke, but that spoke no longer has an open-hall path back to Start.
`room-east` still has its secret door onto `1417-934`. From Start, 28
spaces remain in range. Known-unreachable went from 117 to 252.

Two linked corridor neighbors in the five-step glow must never share a
step number. A same-step allowance (equal counts when two paths are
the same length) was tried and reverted: it was an unrequested change
and it broke that rule. The test is strict again. Jason approved
cutting the corner-only open `1358-918` / `1385-982`; `1385-982` is
now 4 via the real edge through `1417-934`.

Local **L** draws every stored board link once, center to center: open
halls bright green, ordinary doors yellow, secret doors purple dashed.
It is dev-only, next to **B** and **D**. The group uses a data
attribute on the board and a separate display rule, same pattern as
**D**. Plain **L** used to preview Giant Lizard; that card is Shift+L
so the overlay can have **L**.

## DUN-25 — Wrong door partners retargeted to the print (12 Nov 2026)

The twenty-three L-overlay door/secret marks that still skipped gray
were wrong stored partners, not overlay geometry. Each tuple was
checked on the 1981 line drawing. Seventeen were retargeted or
dropped; six looked like remaining gray because the overlay aimed at
the box edge instead of the printed ink gap.

Retargets: room-west onto `1057-974`, room-east-southeast onto
`1385-982`, room-east's secret onto `1417-864` (the east wall; the
west wall already has the ordinary door onto `1319-730`), room-2-03
onto `320-231`, the laboratory onto `1551-356`, the annex onto
`1820-1432`, room-5-10 onto `1924-504`, Queen's Treasure onto
`1802-1189`, room-2-01 onto `395-230`, the Armory onto `401-453`,
room-northeast onto `1319-730`, room-northwest onto `1011-741`,
room-5-09 onto `1354-409`. Dropped extras whose real door was
already stored: room-2-02/`638-260`, room-4-09/`895-1283`,
room-4-04/`874-243`, room-3-11/`478-1032`. Kind never changed.

**Ink-gap overlay.** The L door/secret test no longer uses box math
or a 28px wall band. It rasterizes each mark at the real 5px
round-cap stroke (secrets dashed 14/10) and samples the local
reference PNG; any abyss-gray pixel (luminance 90–205) fails. The
allowlist stays empty. Marks aim at hall-white facing the printed
door gap, not the AABB edge. CI skips that pixel test when the
gitignored PNG is missing.

**Unclear second S.** room-2-02's northeast secret onto `639-160` is
on the print. A second secret onto `669-214` is not clearly printed;
it was dropped rather than guessed or allowlisted.

**Armory path.** The Armory door onto vestibule `401-453` is real.
The print also shows an **S** on room-2-05's east wall into
room-2-08, which already doors north into that vestibule. That
secret is stored, so Armory, `401-453`, and room-2-08 are reachable
again. No link was added through a wall.

**room-3-11 west hall.** The print shows no door on room-3-11's west
wall; gray abyss sits between that room and the north–south hall
(`478-1032` and its neighbors). The dropped west door was the only
stored path into those 13 squares, and it was a through-wall guess.
An **S** on room-3-13's east wall faces that hall, but room-3-13 is
itself off the Start graph. Those 13 corridors stay named
unreachable. No door was invented.

**Printed-neighbor steps.** On top of the strict same-step corridor
test (unchanged): printed neighbors in Start's five-step glow, with
no third space between them, fail when the gap is open floor and the
steps are equal or differ by 2 or more, or when a stored link has a
step difference other than 1. Ink-wall pairs do not fail; they are
listed in the printed-neighbor test. No wall was opened to make numbers match.

From Start the five-step glow is 29 spaces. Known-unreachable is
263 (was 266 after the partner retargets, 252 on main): Armory,
`401-453`, and room-2-08 came back; the 13-square west hall of
room-3-11 did not.

## DUN-26 — Map debug tools live in one folder (12 Nov 2026)

B, L, and D are local map-inspection tools, not the game. They had
been mixed into `src/rendering/` next to the code that draws the
board. They now live in `src/debug-tools/`: the reference overlay
(B), the stored-link overlay (L), the step-number overlay (D), the
dev-only key bindings, the helpers that draw those marks, and the
PNG luminance reader the pixel tests use.

Monster-card preview keys (G, H, R, and Shift) stay in `src/cards/`.
Those preview a card, not the map. Overlay CSS stays in `style.css`.
The Vite plugin that serves the local PNG stays in `vite.config.ts`.
`main.ts` is unchanged. Production still binds none of these keys.
Nothing about how the overlays look or how the game plays changed;
only import paths moved.

## DUN-27 — Debug mode from the web address (12 Nov 2026)

Jason wants the L and D map tools on the live GitHub Pages site, not
only in `npm run dev`. `?debug` in the address turns debug mode on.
`debugOptions` names which overlays start visible: `links` is L,
`steps` is D, comma-separated. Example:
`?debug&debugOptions=links,steps`.

Without `?debug`, production is unchanged: no B/L/D keys, and those
overlays are not in the board. With `?debug`, the keys work on the
live site too. `npm run dev` still turns the tools on with no query.

The address is parsed in one small class, `DebugMode`, in
`src/debug-tools/`. `main.ts` stays thin. Monster-card preview keys
stay local-only.

**B stays local.** The reference drawing is a fan copy we do not
publish. The B key can bind when debug is on, but the overlay still
no-ops if the gitignored PNG is missing. A later PR will add a button
to load a file from the user's own computer.

## DUN-28 — OverlayDrawn, not debug code in DungeonSession (12 Nov 2026)

Jason: DungeonSession should not set debug attributes itself. When it
finishes drawing the play overlay it publishes one event,
`EVENT_OVERLAY_DRAWN` (`OverlayDrawn`). There is no start/end pair.

`DebugOverlayListener` in `src/debug-tools/` hears that event and
adds the L and D overlays from `debugMode` / `debugOptions`, and
binds B/L/D. `DebugMode` takes an `isDev` flag (passed in from
`main.ts`, not read as a global) so `isOn()` is true in `npm run
dev` as well as with `?debug`. `main.ts` then checks only
`debugMode.isOn()` before wiring the map and card-preview
listeners. `main.ts` reads `import.meta.env.DEV` only once, as
the flag passed into `DebugMode`.

`MonsterCardPreviewListener` in `src/cards/` hears the same
OverlayDrawn event and binds G/H/R. Those keys follow debug
mode too, including `?debug` on the live site. With no query on
production, nothing is wired. DungeonSession has no
`import.meta.env` checks and no debug or card-preview code.
`debugOptions` starting visibility is applied on the first
OverlayDrawn only; later redraws re-append L/D marks but leave
the user's toggle state alone.

## DUN-29 — Load the reference drawing from the user's computer (12 Nov 2026)

The printed-board PNG is a fan copy we do not publish, so B is a
no-op on the live site even with `?debug`. A small **Load
reference image** control in `src/debug-tools/` is wired only when
`debugMode.isOn()`. `main.ts` stays thin. There are no new
`import.meta.env` checks.

The picker is `ReferenceImagePicker`. `DebugTools` wires it, and
the L/D and G/H/R listeners, from board lifecycle events. `main.ts`
only checks `debugMode.isOn()` and calls `DebugTools.listen`.

The button opens a file picker. `ReferenceImageFile` reads the
file locally (`URL.createObjectURL`), checks 2200×1702, and
revokes the previous object URL. Nothing is uploaded. Then B
shows that image in the same place as the local
`reference-board-map.png`. Locally, if the PNG is already present,
B still works as today; the picker is another way to supply the
image.

`EVENT_REFERENCE_IMAGE_LOADED` (`ReferenceImageLoaded`) lives in
`reference-image-events.ts`. The picker publishes it on the board
SVG. `bindReferenceOverlay` hears that event and uses the object
URL. If the file is not 2200×1702, a short message says so, and
the image is still used.

No localStorage. That would remember the last file across visits,
but the browser cannot keep the real file, only a copy, and this
PR stays small. A later change can add it if we want.

## DUN-29 — Lifecycle events instead of inline order in main.ts (12 Nov 2026)

Jason asked to combine the two debug blocks in `main.ts`. The
order still matters (OverlayDrawn listeners before the first
draw, picker after the svg is attached), but `main.ts` should
not know that sequence.

Board setup now publishes `EVENT_BOARD_DRAWING` (`BoardDrawing`)
just before the svg is created, and `EVENT_BOARD_DRAWN`
(`BoardDrawn`) once that svg is on the page. Those names follow
the existing `EVENT_` / PascalCase pattern (`EVENT_OVERLAY_DRAWN`
= `"OverlayDrawn"`). The constants live in `board-events.ts`.
`placeBoard` is the one function that fires them, creates the
svg, and appends it.

`DebugTools` subscribes at startup: OverlayDrawn listeners
attach on `BoardDrawing` once (`{ once: true }`, so a second
`BoardDrawing` does not hook them again), and the picker places
itself on `BoardDrawn` once (same `{ once: true }`, because a
new picker instance would not see the first one's `placed`
flag). The picker sits immediately after the svg. Production
still publishes the lifecycle events; it just has no debug
listeners. A class that draws the board says the board was
drawn; it is not also responsible for every debug side effect.
That is the same pattern as OverlayDrawn. No `queueMicrotask`
and no `document.body` fallback.

## DUN-32 — Debug mode treats every secret door as found (13 Nov 2026)

Jason wants to walk the whole map while he checks links. With debug
mode on, `main.ts` asks `everySecretDoor` for every secret-door
connection and passes that list into `DungeonSession` as doors the
party has already found. The session only stores the list and gives
it to movement. It does not know about debug mode, and it does not
read the environment.

With debug mode off, the session still starts from an empty list, so
a secret door stays blocked. Searching for secret doors by the 1981
rules comes later.

## DUN-30 — Tidy src folders (12 Nov 2026)

`place-board.ts`, its test, and `board-events.ts` belong with the
code that puts the board on the page, so they moved into
`src/rendering/`. `main.ts` and `dungeon-session.ts` stay at the
`src/` root. The two version tests in `src/` were renamed to
kebab-case (`app-version.test.ts`, `read-app-version.test.ts`) to
match the files they test. Nothing about how the game plays
changed; only paths and test file names moved.

## DUN-24 — Door overlay lines stop on the wall (12 Nov 2026)

Jason: a door line may not cross gray abyss. For a real shared wall,
**L** now draws the yellow/purple mark from the hall square's center
to the door on that wall, not through the room center. Open halls stay
center to center. The point lives in overlay/display code
(`storedDoorMarkEnds`); movement and stored link data are unchanged.
Twenty-three wrong door/secret partners still skip gray; those stay
for a later data fix and are named in the overlay test so this change
does not paper over them.

## DUN-23 — Giant Rats card and clip (12 Nov 2026)

Same pattern as Hobgoblins and Giant Lizard. Files are
`public/cards/L1-giant-rats.jpg` and `.mp4`. Catalog entry is
`hasClip: true` with art (no `hasArt: false`). Local **R** plays the
clip then the card; **Shift+R** shows the card only. Combat numbers
stay the 1981 Magister Rex list already in `monster-combat-values`
(Lightning 7, Fireball 2, Wizard 6, Superhero 3, Hero 4, Elf 5). The
parchment panel is measured at 74/17 with dark `--ink`, so the
caption stays readable and vertically centered in that box.

## DUN-21 — Level 1 monster draw on entering a gold room (12 Nov 2026)

When a pawn ends its move in an occupied Level 1 room, the session
publishes `RoomEntered` with `{ roomType: "monster" }` on the
CustomEvent detail. `MonsterCardDealer` listens with
`listenForRoomEntered(session, "monster")`, reads
`event.detail.roomType`, and draws only when that matches. It takes
the top card of the Level 1 monster deck and publishes
`MonsterCardDrawn`. `MonsterCardPresenter` listens for that draw and
shows the existing reveal overlay (clip if we have one, then the
card). Overlay close still publishes `OverlayClosed`; the dealer puts
the unfought card on the bottom of the pile, the 1981 rule for that
case. Event-name constants start with `EVENT_` so they autocomplete
together (`EVENT_ROOM_ENTERED`, `EVENT_MONSTER_CARD_DRAWN`,
`EVENT_CARD_REVEALED`, `EVENT_OVERLAY_CLOSED`). The map has no
`"monster"` space kind; `RoomType` is a separate filter (`monster` or
`chamber` so far). Only occupied Level 1 rooms publish
`roomType: "monster"` today.

Possible future refactor: whenever we do that refactoring, if we
do, pull a generic `CardDeck` class out of `MonsterCardDealer` and
`MonsterDeck`, but only once another card type (like Clue's weapons
or rooms) actually needs one.

The deck is the 1981 Magister Rex Level 1 list of 7 cards (Giant
Lizard, Giant Rats x2, Goblins x2, Hobgoblins, Skeleton), shuffled
once per game. Giant Rats and Skeleton have no art yet, so they use
a plain parchment card with the shared caption and a red border.

Start, the Main Gallery, and corridors never draw. Other levels and
chambers do nothing yet. Rooms are not cleared yet, so every entry
into a gold room draws again. Local G / H / L previews still work.

The Goblins art's stats box is dark red, not parchment, so the shared
dark `--ink` caption vanished on it. Lookup now carries caption `ink`
on the same per-card stats-box as the parchment bounds. Goblins uses
`--parchment` ink; Hobgoblins, Giant Lizard, and the no-art cards stay
dark on parchment. The real-turn overlay was already rendering the
caption; it was just unreadable on that art.

Goblins' dark-red panel is taller than the default 74.8/16 bounds
(that box sat at the top of the panel). Its own stats-box is 76/20 so
the name and numbers sit in the middle of that red fill. Hobgoblins
keeps 74.8/16 and Giant Lizard keeps 67/19.

https://magisterrex.wordpress.com/2011/04/11/whats-in-that-game-box-dungeon-fantasy-boardgame/

## DUN-20 — Giant Lizard card and clip (12 Nov 2026)

Same pattern as Hobgoblins, one monster. Files are
`public/cards/L1-giant-lizard.jpg` and `.mp4`. Local **L** plays the
clip then the card; **Shift+L** shows the card only. The hyphenated
slug from DUN-19 already maps `Giant Lizard` to those files. The
shared dark serif caption is unchanged.

Giant Lizard combat numbers are the 1981 TSR card list as posted on
Magister Rex (Lightning 2, Fireball 2, Wizard 5, Superhero 2, Hero
4, Elf 5):
https://magisterrex.wordpress.com/2011/04/11/whats-in-that-game-box-dungeon-fantasy-boardgame/

The Giant Lizard art has a taller parchment box that starts higher
than Goblins and Hobgoblins. A single caption offset sat too low and
overlapped the gem. Lookup now carries each card's stats-box
(`topPercent` / `heightPercent`), defaulting to the Goblins/Hobgoblins
layout. The shared caption still uses the same dark serif; it only
changes where that block sits so the name and numbers stay centered
inside that card's own parchment.

## DUN-19 — Hobgoblins card and clip (11 Nov 2026)

Same pattern as Goblins, one monster. Files are
`public/cards/L1-hobgoblins.jpg` and `.mp4`. Local **H** plays the
clip then the card; **Shift+H** shows the card only. File names
hyphenate spaces (`Giant Lizard` → `L1-giant-lizard`) so later
multi-word monsters drop in the same way.

Hobgoblins combat numbers are the 1981 TSR card list as posted on
Magister Rex (Lightning 3, Fireball 3, Wizard 6, Superhero 3, Hero
5, Elf 4):
https://magisterrex.wordpress.com/2011/04/11/whats-in-that-game-box-dungeon-fantasy-boardgame/

## DUN-19 — Caption ink, centering, and serif (11 Nov 2026)

The caption used cream page text, so it vanished on the parchment, and
it sat too low and too wide for the printed stats box. Shared caption
CSS now uses the same dark `--ink` and Georgia serif as the rest of
the game (name and numbers together), and it centers that block inside
the parchment area. Goblins and Hobgoblins share this one caption
style.

## DUN-17 — No open hall through the gold/magenta wall (11 Nov 2026)

A hero on `corridor-1068-485` (level 1, gold) could highlight
`corridor-1053-429` (level 4, magenta) in one turn. Movement only
walks recorded connections; it does not invent grid neighbors. The
1981 drawing has a wall between those halls. Five `open` links in
`board-open-links-1.ts` crossed that wall: 1053-429 to 1068-485 and
to 1016-486, 999-432 to 1016-486, 1122-456 to 1053-429, and 1122-417
to 1122-456. Those tuples are gone. Same-level joins on each side of
the wall stay. The known-unreachable list is unchanged (100).
Wall-separated pairs for the one-move highlight live in
`src/movement/wall-separated-space-pairs.ts`; the movement test walks
that table so a new pair is data only.
Also listed: 1122-417/1122-456 and 1122-417/1053-429; the leftover
open hall from 1122-417 to 1053-429 is gone. Unreachable count stays 100.

## 2026-11-18 — One kind on a link

Wizard's Treasure Room was stored twice onto the same squares. Jason
added ordinary doors onto `corridor-1828-214` and `corridor-1880-295`
and left the older links in place: a secret door on `1828-214`, and
the open hall on `1880-295` from DUN-16. Movement walks a door whether
or not a secret has been found, so the secret did not block, and the
open hall made the new door do nothing. A pair of spaces keeps one
kind. These two pairs keep the ordinary doors he added. The leftover
secret door and the leftover open hall are gone. `1764-226` is still
a secret door, and that one still blocks until it is found.

## 2026-11-18 — A room may open into a hall

The board check required every numbered room to have a door or a
secret door. Jason joined room-3-16 to `corridor-2044-1485` and
`corridor-1937-1568`, and room-6-06 to `corridor-1680-637`, with open
links and no door. That is the same kind he used where a chamber wall
has no door tab. A numbered room now passes when it has a door, a
secret door, or an open link onto a real space. A room with no link
at all still fails.

## 2026-11-18 — Kitchen and Guard Room corner

Jason checked the printed board around the Kitchen and the Guard Room
(about x 460–540, y 930–1000). The real squares there are
`corridor-522-949` and `corridor-480-996`. `corridor-489-949` was an
extra square with no links, which is why it was the last unreachable
space. `corridor-480-960` sat between the two real squares and was the
only thing joining them. Both extra squares are gone. `522-949` now
opens straight into `480-996`. The Guard Room door on `522-949` stays,
and `480-996` still steps down to `corridor-478-1032`. Nothing on the
board is unreachable from the Main Staircase.

## 2026-11-18 — room-north door mark

room-north's door link was already onto `corridor-1118-486`. The
stored door mark was still named `corridor-1068-485 room-north`, and
its line sat on that old square, from (1068.5, 485) to (1063.5,
502.5). Jason checked the overlay. The printed door is the gap in the
wall between `corridor-1118-486` and room-north just below it. The
mark now uses that pair. It starts at the corridor center (1118,
486.5) and ends at the gap on the corridor's south edge (1119,
504.5).

## DUN-33 — Merge duplicate corridor squares (19 Nov 2026)

Ten pairs of corridor markers were two boxes on one real flagstone.
Each pair is now one square. The box is the union of the two old
boxes, and the id uses the floored center, the same way the other
corridor ids are named (`corridor-<x>-<y>`). Links that named either
old id now name the kept square. The link that joined the two halves
is gone, and a neighbor that was stored twice is stored once. The
room-3-10 door mark follows `corridor-338-1048`. It starts at
that square's center (338.5, 1048) and still ends on the same door
gap (318.5, 1047.5).

Corridor level is not used for monster fights. Jason said to leave
every other level alone, and to keep the surviving square's level for
the two pairs that disagreed. Pair 7 keeps level 5 from
`corridor-1476-598` (the level 1 marker `corridor-1437-598` is the one
that was deleted). Pair 8 keeps level 1 from `corridor-1436-640` (the
level 6 marker `corridor-1475-640` is the one that was deleted). No
board-color check was used for those two. Removing corridor levels
altogether is a later change. The kept square in each pair is the
first id Jason named. A tenth pair, `corridor-1443-554` and
`corridor-1455-562`, is the same kind of double mark. The kept record
is `corridor-1443-554` at level 5, now `corridor-1449-562` with bounds
1403, 530, 93 by 64. Its open halls are `corridor-1391-547` and
`corridor-1457-598`. It does not touch `corridor-1456-640`; the path
goes through `corridor-1457-598`. The gray-floor bans from
`corridor-1454-489` and `corridor-1408-491` follow that square, one
ban each. There are 337 corridor squares, and every space is still
reachable from the Main Staircase.

## DUN-34 — Four spaces split on a printed secret door (19 Nov 2026)

Four stored spaces each covered two printed spaces with a secret door
between them. Each one is now two spaces, joined by a secret door.
A secret door still blocks a hero until the party has found it.
With every secret door found, the whole map is still reachable from
the Main Staircase.

**Torture Chamber.** The named yellow chamber stays `torture-chamber`
(level 4), box 983,1267 153×143. The small flagstone on its southeast
corner is now `corridor-1167-1389` (level 4), box 1143,1370 49×39.
The printed S is about (1136, 1380). The three open halls
(`1078-1246`, `949-1298`, `1155-1317`) stay on the chamber. They
touch the chamber, not the flagstone.

**room-2-05.** The numbered room stays `room-2-05` (level 2), box
316,481 40×79. The flagstone above it is `corridor-351-449` (level 2),
box 322,434 58×31. The printed S between them is about (345, 470).
The open hall into vestibule `401-453` moves onto the flagstone,
because that is the half that touches the vestibule. The south open
hall to `337-584`, the door to room-2-07, and the secret door to
room-2-08 stay on the room. That secret door is on the room's east
wall, about (355, 498), not on the north flagstone.

**room-3-13.** Both halves are orange level-3 rooms. The upper one
keeps `room-3-13`, box 341,1284 94×65. The lower one is `room-3-17`,
box 351,1365 70×86. The printed S is about (375, 1352). The east door
onto `464-1279` stays on the upper room. Level 3 now has 17 numbered
rooms. The old Zenopus count of 16 had stored this pair as one room.
There is a stored door mark named for room-3-13 and room-3-15, but
there was never a door link, and the line drawing shows a solid wall
between the lower room and room-3-15. The mark is renamed onto
room-3-17. No door was added. The lower room also has a printed door
west into a yellow corridor. That door was not stored before, so it
is still not stored.

**stairs-west.** The stair oval keeps `stairs-west` (level 1, down to
level 4), box 811,741 89×48. The flagstone north of the S is
`corridor-897-706` (level 1), box 870,682 54×49. The printed S is
about (885, 735). The open hall to `934-689` moves onto that
flagstone. The door to room-3-04 and the open halls to `792-768` and
`909-774` stay on the stairs. Corridors are 340 (was 337).

## DUN-35 — Room colors follow the printed board (19 Nov 2026)

A room's fill is its level. The 1981 board was checked by laying
Jason's color photo on the line map and sampling each room. Several
numbered rooms were stored in the wrong color zone. Their levels now
match the print. The Armory is level 3, with the orange rooms around
it. The Kitchen is level 2, with the green rooms around it and the
Guard Room. Corridor levels were not touched.

Room ids were left as they are. `room-2-01` is now a level 3 room, and
other ids are in the same boat. Renaming them so the number in the id
matches the level is a later change.

Four spaces are really corridors, not rooms: `room-2-05`, `room-3-16`,
`room-6-01`, and `room-6-02`. They stay numbered rooms for now. A
later change will turn them into corridors.

Numbered rooms per level were 9, 9, 17, 18, 16, and 12. They are now
9, 9, 17, 18, 15, and 13. Levels 1 through 4 stay put, including the
extra level 3 room from the secret-door split (`room-3-17`). Level 5
loses one room and level 6 gains it, because `room-3-08` is printed
light cyan and only one red room (`room-4-18`) comes back the other
way. The old tests expected the earlier census, so they now expect
15 and 13.

Named chambers still total one on level 1, two on levels 2, 3, 4, and
6, and four on level 5. The Armory and the Kitchen traded levels, so
those totals did not move.

Stairs still point where they did. `stairs-west` is still level 1,
down to level 4. Monster cards are still looked up by the monster's
own level. The only room rule that cares about level is "an occupied
level 1 room draws from the level 1 deck." `room-4-06` is that kind of
room now. `room-north` is not, because the print is magenta there.

The level 1 fill moved from `#e3b23c` to `#c8801b` so the tan-orange
rooms are darker than the corridor gold `#d4b44a`. Level 2 moved from
`#3f8f4a` to `#40b84a`. Level 6 moved from `#2f7cc0` to `#0dc4da`.
Levels 3, 4, and 5 stay `#e07020`, `#c4458a`, and `#d23a32`. Chamber
names stay on the cream chamber fill, and the door dots stay dark.

## DUN-36 — Four stored rooms are really corridors (19 Nov 2026)

Jason checked the line map and the color photo. Four stored rooms
were yellow corridor floor, or a room with a corridor stuck on the
end. They are corridors now. Each new corridor keeps the old room's
level for now. Dropping corridor levels is a later change. A secret
door still blocks a hero until the party has found it. With every
secret door found, the whole map is still reachable from the Main
Staircase.

**The hall that was room-2-05.** That green shape is a yellow
corridor. It is now `corridor-336-520` (level 2), on the same box
316,481 40×79. Together with the north flagstone `corridor-351-449`
it is two corridor squares with one secret door between them. The
printed S is in the wall between those squares, and the door mark
sits on that shared edge. The line map and the clear 1981 photo
show a solid wall on the east side, with no S into room-2-08, so
that secret door and its mark are gone. room-2-08 still has its
ordinary door onto `corridor-401-453`. The open hall south to
`corridor-337-584` and the door west to room-2-07 stay on the
south square.

**room-4-16.** The print is a magenta room with a yellow flagstone
on its south side. An S sits in the wall between them, about
(1407, 1489). The room keeps `room-4-16` (level 4), now box
1345,1405 91×76. The flagstone is `corridor-1411-1515` (level 4),
box 1385,1496 53×38. That one secret door joins them. The corridor
floor runs straight through to `corridor-1354-1517` on the west and
`corridor-1452-1517` on the east, so those two joins are open halls.
Their old secret-door marks are gone. The ordinary door north into
`corridor-1384-1372` stays on the room.

**The halls that were room-3-16.** The line map shows two corridor
squares, one above the other, with an open join and no S. The upper
one is `corridor-1986-1495` (level 3), box 1964,1466 45×58. The
lower one is `corridor-1982-1555` (level 3), box 1959,1524 46×63.
They are joined by an open hall. The open link to `corridor-2044-1485`
stays on the upper square. The open link to `corridor-1937-1568`
stays on the lower square.

**North of the King's Treasure Room.** room-6-01 and room-6-02 are
two corridor squares. The printed S between them is about (1892, 633).
They are now `corridor-1858-626` and `corridor-1920-626` (both level
6), on the same boxes 1827,596 62×60 and 1889,596 62×60. The secret
door stays between them. Its mark sits on the shared edge, where the
printed S is, about (1892, 633). The west square keeps the open hall
to `corridor-1799-637`. The east square keeps the open halls to
`corridor-1931-674` and `corridor-1925-566`.

The old room ids and their wall outlines are gone. Numbered rooms
per level were 9, 9, 17, 18, 15, and 13. They are now 9, 8, 16, 18,
15, and 11. Corridors were 340. They are now 346.
