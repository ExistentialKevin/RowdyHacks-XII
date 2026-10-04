# Heist School — Project Status

*Snapshot: October 4, 2026 (RowdyHacks XII)*

## What it is

**Heist School** is a browser game that teaches Python through heist-themed puzzles. Players write real Python in an in-browser editor, and the code runs client-side via **Pyodide** (WebAssembly) to move a character through security mazes — avoiding cameras, collecting loot, and reaching the exit.

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16.3.8 (App Router, Turbopack), React 19.2 |
| Language | TypeScript |
| Styling | Tailwind CSS v4, dark "heist" theme matched to Figma |
| Python runtime | Pyodide (self-hosted copy in `public/pyodide/` **and** jsDelivr CDN v0.23.4 — see issues) |
| Editor | CodeMirror (`@uiw/react-codemirror`, Python lang, Tokyo Night theme) |
| Installed but unused | `phaser` |

Run locally: `npm run dev` (or `pnpm dev`) → http://localhost:3000

## Routes

| Route | Status | Notes |
|---|---|---|
| `/` | ✅ Working | Home page: navbar, "Mission Directory" hero, horizontal level-card carousel with arrows + dots |
| `/levels/2` | ✅ Playable | **Security Maze** — `move("UP"/"DOWN"/"LEFT"/"RIGHT")`, 3 cameras with 3-tile vision cones, 3 items to collect, then reach exit. Includes first-visit spotlight tutorial (saved in `localStorage`) |
| `/levels/3` | 🟡 Placeholder | Page metadata describes a "Terminal Access" puzzle (read an access code, store it in a variable), but `PagePuzzle.tsx` is currently a near-copy of Level 2 with the tutorial removed |
| `/bird-peep` | 🧪 Demo | Talking-character overlay test — plays `demo.wav` while flapping between open/closed mouth sprites |
| `/game/1`–`/game/4` | ❌ 404 | Level cards and the navbar link here, but no `app/game/.../page.tsx` exists |

## Code layout

```
app/
  page.tsx, layout.tsx, globals.css   Home page + root layout/theme
  components/                         Navbar, MiddleColumn, LevelList (carousel), LevelCard (re-export)
  data/levels.ts                      Level card data (4 levels, hard-coded progress)
  game/                               Original modular maze engine (MazeGame, CodeEditor, MazeBoard,
                                      ConsolePanel, useMazeRunner, usePyodideRuntime) — NOT routed
  levels/
    2/SecurityMazeGame.tsx            Self-contained Level 2 (~566 lines)
    3/PagePuzzle.tsx                  Self-contained Level 3 (~600 lines, clone of L2)
    components/, hooks/, lib/         Copies of the game/ engine + security.ts — mostly unused by L2/L3
                                      (only TutorialOverlay is imported)
  bird-peep/                          Talking overlay demo
public/
  pyodide/                            Self-hosted Pyodide runtime
  game/starter.py, lil_guy.jpg        Starter code for the modular engine
  bird-peep/, sounds/                 Character sprites + audio
assets/                               lil_guy.jpg, lil-open.png, lil-closed.png (latter two untracked)
```

## Recent progress (git)

19 commits from ExistentialKevin (8), Salvador (8), esteban-ai24 (3). Latest highlights:

- Fixed hydration error when returning to the home page
- Tutorial overlay for Level 2
- Mouth-flap logic for the "lil guy" character, ready for real assets
- Home page split into components, theme matched to Figma, routes restructured for levels
- New Security Maze (Level 2) and a standardized game engine

**Working tree:** ~36 files show as modified, but the content diff is empty when ignoring line endings — these are CRLF/LF changes only. `.claude/` and `assets/lil-*.png` are untracked.

## Known issues / gaps

1. **Broken level links** — `data/levels.ts` and `Navbar` point to `/game/N`; actual pages live at `/levels/2` and `/levels/3`. Level 1 and Level 4 have no page at all.
2. **Level 3 not built** — the terminal/access-code mechanic still needs to be implemented.
3. **Duplicated code** — `app/game/` and `app/levels/{components,hooks,lib}` are near-identical engines, and Levels 2 and 3 each inline their own copy of types, grid, Pyodide loader and runner instead of using either.
4. **Two Pyodide sources** — the modular engine loads from `/public/pyodide`, while Levels 2/3 load v0.23.4 from jsDelivr (needs network; version mismatch with the `pyodide@314` npm package).
5. **Placeholder art** — items/cameras use `placehold.co` emoji images; character assets exist but aren't in the levels yet.
6. **Level card progress is fake** — `current/total` values are hard-coded, not tracked.
7. **Housekeeping** — both `package-lock.json` and `pnpm-lock.yaml` present; `phaser` unused; README is still the create-next-app default.

## Suggested next steps

1. Point level cards + navbar at real routes (or add `app/levels/1` and `app/levels/4`), so the home page flows into gameplay.
2. Build Level 3's terminal puzzle and a Level 1 intro (variables/basic `move`).
3. Pull Level 2/3 onto one shared engine (`levels/hooks` + `levels/lib`) and delete `app/game/` once nothing imports it.
4. Pick one Pyodide source (self-hosted is safer for a demo venue with flaky Wi-Fi).
5. Drop in the lil guy talking overlay as the level narrator, and swap placeholder sprites for real art.
6. Replace the README with a short project description + demo instructions for judging.
