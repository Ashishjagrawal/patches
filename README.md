# Patches — Rectangle Logic Puzzle

A free, ad-free rectangle logic puzzle game inspired by [Shikaku](https://en.wikipedia.org/wiki/Shikaku) and LinkedIn's Patches. Built with React, playable in any browser, installable as a PWA on mobile.

**[Play Now](https://ashishjagrawal.github.io/patches/)**

## How It Works

You're given a grid with numbered clues. Each clue tells you two things:

- **Shape type** — Square (width = height), Wide (width > height), or Tall (height > width)
- **Cell count** — how many cells the rectangle must cover

Your goal: fill the entire grid with non-overlapping rectangles, where each rectangle contains exactly one clue and matches its shape and size.

## Features

- **250 levels** with continuous numbering — no menus to navigate, just pick and play
- **5 difficulty tiers** that progressively introduce harder mechanics:
  - **Easy** (5×5) — small grids, small rectangles, clues near edges
  - **Medium** (6×6) — slightly larger grids and shapes
  - **Hard** (7×7) — larger rectangles with many possible placements, clues placed anywhere
  - **Expert** (8×8) — minimum area of 3, rectangles up to 12 cells, high ambiguity
  - **Master** (9×9) — rectangles up to 16 cells, maximum reasoning required
- **Gentle onramp** — first 10 levels are Easy/Medium only, then all difficulties are shuffled
- **Drag to draw** — click/tap and drag to create rectangles (desktop + mobile touch)
- **Tap to remove** — tap any placed patch to remove it
- **Undo, Hint, Reset** controls
- **Star ratings** (1–3 stars) based on completion time
- **Progress saved** in localStorage — pick up where you left off
- **PWA** — install on your home screen for an app-like experience
- **Fully offline** — works without internet after first load
- **No ads, no accounts, no tracking**

## What Makes It Harder

The difficulty system is based on real Shikaku puzzle design principles:

| Factor | Easy | Master |
|---|---|---|
| Grid size | 5×5 (25 cells) | 9×9 (81 cells) |
| Max rectangle area | 5 | 16 |
| Min rectangle area | 2 | 3 |
| Clue placement | Near edges (predictable) | Anywhere (ambiguous) |
| Rectangle size bias | Mixed | Biased toward large |
| Possible shapes per clue | Few | Many (e.g., 12 = 1×12, 2×6, 3×4) |

Larger composite numbers (like 12, 16) have many possible rectangle dimensions, so you must cross-reference neighboring clues to eliminate options — the core challenge of Shikaku.

## Tech Stack

- **React 19** — UI components
- **Vite 8** — build tooling
- **vite-plugin-pwa** — service worker + manifest generation
- **GitHub Pages** — hosting via GitHub Actions
- **Zero dependencies** beyond React — no state library, no CSS framework, no router

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── App.jsx                  # Screen routing
├── components/
│   ├── Board.jsx            # Interactive grid with drag-to-draw
│   ├── GameScreen.jsx       # Gameplay: timer, controls, completion
│   ├── MainMenu.jsx         # Level grid with difficulty tags
│   └── HowToPlay.jsx        # Rules explanation
└── utils/
    ├── puzzleEngine.js      # Generation, validation, solution checking
    ├── levelGenerator.js    # 250 levels with structured difficulty curve
    ├── storage.js           # localStorage persistence
    └── colors.js            # Patch color palette
```

## How Puzzles Are Generated

Each puzzle is created by:

1. **Partitioning** the grid into rectangles using a greedy scan with randomized candidate selection
2. **Placing clues** inside each rectangle — near edges for easy puzzles, randomly for hard ones
3. **Validating** that every cell is covered exactly once
4. **Seeding** with a deterministic PRNG so the same level always produces the same puzzle

The difficulty parameters (grid size, min/max area, size bias, clue placement) control how many possible rectangle configurations exist for each clue — more options means harder deduction.

## License

MIT
