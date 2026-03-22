import { generatePuzzle, DIFFICULTY } from './puzzleEngine.js';

/*
 * Level distribution (250 total):
 *   Levels  1-10:  Easy + Medium only (shuffled) — gentle onboarding
 *   Levels 11-250: All 5 difficulties shuffled — progressive challenge
 *
 * Difficulty counts:
 *   easy:   40    (5 in intro + 35 later)
 *   medium: 50    (5 in intro + 45 later)
 *   hard:   60
 *   expert: 50
 *   master: 50
 *   Total: 250
 */

function hashSeed(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash) + 1;
}

function seededShuffle(arr, seed) {
  const a = [...arr];
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 16807 + 0) % 2147483647;
    const j = s % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function makeLevels(difficulty, count, startSeedIndex) {
  const config = DIFFICULTY[difficulty];
  const levels = [];
  for (let i = 0; i < count; i++) {
    const seed = hashSeed(`${difficulty}-${startSeedIndex + i}`);
    const clues = generatePuzzle(config.rows, config.cols, seed, config);
    levels.push({
      id: `${difficulty}-${startSeedIndex + i}`,
      difficulty,
      rows: config.rows,
      cols: config.cols,
      seed,
      clues: clues.map(({ clueRow, clueCol, area, shape }) => ({
        clueRow, clueCol, area, shape,
      })),
      solution: clues.map(({ row, col, w, h }) => ({ row, col, w, h })),
    });
  }
  return levels;
}

export function generateAllLevels() {
  // Intro batch: 5 easy + 5 medium, shuffled
  const introEasy = makeLevels('easy', 5, 0);
  const introMedium = makeLevels('medium', 5, 0);
  const introBatch = seededShuffle([...introEasy, ...introMedium], 77);

  // Main batch: remaining levels of all difficulties, shuffled
  const mainEasy   = makeLevels('easy',   35, 5);
  const mainMedium = makeLevels('medium', 45, 5);
  const mainHard   = makeLevels('hard',   60, 0);
  const mainExpert = makeLevels('expert', 50, 0);
  const mainMaster = makeLevels('master', 50, 0);
  const mainBatch = seededShuffle(
    [...mainEasy, ...mainMedium, ...mainHard, ...mainExpert, ...mainMaster],
    123
  );

  // Combine and assign continuous level numbers
  const all = [...introBatch, ...mainBatch];
  return all.map((level, i) => ({
    ...level,
    levelNumber: i + 1, // continuous 1-250
  }));
}
