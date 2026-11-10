# Decisions

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
