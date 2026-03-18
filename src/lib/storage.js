export const STORAGE_KEY = 'pool-league';

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { players: [], matches: [], bracket: null };
    const data = JSON.parse(raw);
    return {
      players: Array.isArray(data.players) ? data.players : [],
      matches: Array.isArray(data.matches) ? data.matches : [],
      bracket: data.bracket ?? null,
    };
  } catch {
    return { players: [], matches: [], bracket: null };
  }
}

export function saveState(players, matches, bracket = null) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ players, matches, bracket }));
  } catch (e) {
    console.warn('Could not save to localStorage', e);
  }
}
