// Shape types for clues
export const SHAPE = {
  SQUARE: 'square',
  WIDE: 'wide',
  TALL: 'tall',
};

// Determine shape type from dimensions
export function getShapeType(w, h) {
  if (w === h) return SHAPE.SQUARE;
  if (w > h) return SHAPE.WIDE;
  return SHAPE.TALL;
}

// Seeded random number generator (mulberry32)
function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle(arr, rng) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/*
 * Difficulty levers:
 * - Grid size: larger = harder (more interactions)
 * - maxArea: larger areas have more possible rectangle shapes (ambiguity)
 * - minArea: raising minimum forces fewer trivial 2-cell rects
 * - preferLarge: bias toward bigger rects (harder to place)
 * - clueEdgeBias: false = clues placed randomly inside rect (harder);
 *                 true = clues near edges (easier to reason about)
 */
export const DIFFICULTY = {
  easy:   { rows: 5, cols: 5, label: 'Easy',   minArea: 2, maxArea: 5,  preferLarge: false, clueEdgeBias: true },
  medium: { rows: 6, cols: 6, label: 'Medium', minArea: 2, maxArea: 6,  preferLarge: false, clueEdgeBias: true },
  hard:   { rows: 7, cols: 7, label: 'Hard',   minArea: 2, maxArea: 9,  preferLarge: true,  clueEdgeBias: false },
  expert: { rows: 8, cols: 8, label: 'Expert', minArea: 3, maxArea: 12, preferLarge: true,  clueEdgeBias: false },
  master: { rows: 9, cols: 9, label: 'Master', minArea: 3, maxArea: 16, preferLarge: true,  clueEdgeBias: false },
};

// Generate a puzzle by subdividing a grid into rectangles
export function generatePuzzle(rows, cols, seed = Date.now(), config = {}) {
  const { minArea = 2, maxArea = 9, preferLarge = false, clueEdgeBias = true } = config;
  const rng = mulberry32(seed);
  const totalCells = rows * cols;

  for (let attempt = 0; attempt < 100; attempt++) {
    const result = tryGenerate(rows, cols, rng, minArea, maxArea, preferLarge);
    if (result && result.length > 0) {
      const covered = new Set();
      for (const rect of result) {
        for (let r = rect.row; r < rect.row + rect.h; r++) {
          for (let c = rect.col; c < rect.col + rect.w; c++) {
            covered.add(r * cols + c);
          }
        }
      }
      if (covered.size === totalCells) {
        return result.map((rect) => {
          let clueRow, clueCol;
          if (clueEdgeBias) {
            // Place clue near an edge of the rect (easier to spot)
            clueRow = rng() < 0.5 ? rect.row : rect.row + rect.h - 1;
            clueCol = rng() < 0.5 ? rect.col : rect.col + rect.w - 1;
          } else {
            // Random interior placement (harder — clue could be anywhere)
            clueRow = rect.row + Math.floor(rng() * rect.h);
            clueCol = rect.col + Math.floor(rng() * rect.w);
          }
          return {
            ...rect,
            area: rect.w * rect.h,
            shape: getShapeType(rect.w, rect.h),
            clueRow,
            clueCol,
          };
        });
      }
    }
  }
  return fallbackGenerate(rows, cols, rng);
}

function tryGenerate(rows, cols, rng, minArea, maxArea, preferLarge) {
  const grid = Array.from({ length: rows }, () => Array(cols).fill(false));
  const rects = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c]) continue;

      const candidates = [];
      for (let h = 1; h <= rows - r; h++) {
        for (let w = 1; w <= cols - c; w++) {
          const area = w * h;
          if (area < minArea || area > maxArea) continue;
          let fits = true;
          for (let dr = 0; dr < h && fits; dr++) {
            for (let dc = 0; dc < w && fits; dc++) {
              if (grid[r + dr][c + dc]) fits = false;
            }
          }
          if (fits) candidates.push({ row: r, col: c, w, h });
        }
      }

      if (candidates.length === 0) {
        if (!grid[r][c]) return null;
        continue;
      }

      shuffle(candidates, rng);

      if (preferLarge) {
        // Sort by area descending, then pick from top 2 (more large rects = harder)
        candidates.sort((a, b) => b.w * b.h - a.w * a.h);
        const pick = candidates[Math.floor(rng() * Math.min(2, candidates.length))];
        markGrid(grid, pick);
        rects.push(pick);
      } else {
        // Mild size preference, pick from top 3-4
        candidates.sort((a, b) => b.w * b.h - a.w * a.h);
        const pick = candidates[Math.floor(rng() * Math.min(4, candidates.length))];
        markGrid(grid, pick);
        rects.push(pick);
      }
    }
  }

  return rects;
}

function markGrid(grid, rect) {
  for (let dr = 0; dr < rect.h; dr++) {
    for (let dc = 0; dc < rect.w; dc++) {
      grid[rect.row + dr][rect.col + dc] = true;
    }
  }
}

function fallbackGenerate(rows, cols, rng) {
  const rects = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c += 2) {
      const w = c + 1 < cols ? 2 : 1;
      const rect = { row: r, col: c, w, h: 1 };
      const clueCol = c + Math.floor(rng() * w);
      rects.push({
        ...rect,
        area: w,
        shape: w === 1 ? SHAPE.SQUARE : SHAPE.WIDE,
        clueRow: r,
        clueCol,
      });
    }
  }
  return rects;
}

// Validate if a placed rectangle is valid for a clue
export function validatePlacement(rect, clue) {
  const area = rect.w * rect.h;
  if (area !== clue.area) return false;
  const shape = getShapeType(rect.w, rect.h);
  if (shape !== clue.shape) return false;
  if (
    clue.clueRow < rect.row ||
    clue.clueRow >= rect.row + rect.h ||
    clue.clueCol < rect.col ||
    clue.clueCol >= rect.col + rect.w
  ) {
    return false;
  }
  return true;
}

// Check if a rectangle overlaps any existing placed patches
export function checkOverlap(rect, patches, excludeIndex = -1) {
  for (let i = 0; i < patches.length; i++) {
    if (i === excludeIndex) continue;
    const p = patches[i];
    if (
      rect.col < p.col + p.w &&
      rect.col + rect.w > p.col &&
      rect.row < p.row + p.h &&
      rect.row + rect.h > p.row
    ) {
      return true;
    }
  }
  return false;
}

// Find which clue is inside a rectangle
export function findClueInRect(rect, clues) {
  const found = [];
  for (let i = 0; i < clues.length; i++) {
    const c = clues[i];
    if (
      c.clueRow >= rect.row &&
      c.clueRow < rect.row + rect.h &&
      c.clueCol >= rect.col &&
      c.clueCol < rect.col + rect.w
    ) {
      found.push(i);
    }
  }
  return found;
}

// Check if the puzzle is completely and correctly solved
export function checkSolution(patches, clues, rows, cols) {
  if (patches.length !== clues.length) return false;

  const covered = new Set();
  for (const p of patches) {
    for (let r = p.row; r < p.row + p.h; r++) {
      for (let c = p.col; c < p.col + p.w; c++) {
        const key = r * cols + c;
        if (covered.has(key)) return false;
        covered.add(key);
      }
    }
  }
  if (covered.size !== rows * cols) return false;

  const usedClues = new Set();
  for (const p of patches) {
    const clueIndices = findClueInRect(p, clues);
    if (clueIndices.length !== 1) return false;
    const ci = clueIndices[0];
    if (usedClues.has(ci)) return false;
    usedClues.add(ci);
    if (!validatePlacement(p, clues[ci])) return false;
  }

  return usedClues.size === clues.length;
}

// Star rating thresholds (seconds)
export const STAR_THRESHOLDS = {
  easy:   [30,  90,  180],
  medium: [60,  180, 360],
  hard:   [120, 300, 600],
  expert: [180, 420, 900],
  master: [240, 600, 1200],
};

export function getStars(difficulty, seconds, usedHint) {
  const thresholds = STAR_THRESHOLDS[difficulty];
  let stars;
  if (seconds <= thresholds[0]) stars = 3;
  else if (seconds <= thresholds[1]) stars = 2;
  else stars = 1;
  if (usedHint && stars > 2) stars = 2;
  return stars;
}
