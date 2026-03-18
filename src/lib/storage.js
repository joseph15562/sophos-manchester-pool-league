export const STORAGE_KEY = 'pool-league';

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const data = JSON.parse(raw);
    return {
      players: Array.isArray(data.players) ? data.players : [],
      matches: Array.isArray(data.matches) ? data.matches : [],
      bracket: data.bracket ?? null,
      groups: Array.isArray(data.groups) ? data.groups : null,
      groupMatches: Array.isArray(data.groupMatches) ? data.groupMatches : [],
    };
  } catch {
    return defaultState();
  }
}

function defaultState() {
  return {
    players: [],
    matches: [],
    bracket: null,
    groups: null,
    groupMatches: [],
  };
}

export function saveState(players, matches, bracket = null, groups = null, groupMatches = []) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ players, matches, bracket, groups, groupMatches })
    );
  } catch (e) {
    console.warn('Could not save to localStorage', e);
  }
}
