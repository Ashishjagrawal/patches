const STORAGE_KEY = 'patches-game-progress';

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function save(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getLevelProgress(levelId) {
  const data = load();
  return data[levelId] || null;
}

export function saveLevelProgress(levelId, stars, time) {
  const data = load();
  const existing = data[levelId];
  if (!existing || stars > existing.stars || (stars === existing.stars && time < existing.time)) {
    data[levelId] = { stars, time, completedAt: Date.now() };
  }
  save(data);
}

export function getAllProgress() {
  return load();
}
