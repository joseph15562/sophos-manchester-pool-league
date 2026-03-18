/**
 * Generate a unique id for matches/players
 */
export function generateId() {
  return crypto.randomUUID?.() ?? `id-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/**
 * Generate round-robin fixture: one match for each unordered pair of players.
 * @param {Array<{ id: string, name: string }>} players
 * @returns {Array<{ id: string, playerAId: string, playerBId: string, winnerId: string | null }>}
 */
export function generateRoundRobin(players) {
  const matches = [];
  for (let i = 0; i < players.length; i++) {
    for (let j = i + 1; j < players.length; j++) {
      matches.push({
        id: generateId(),
        playerAId: players[i].id,
        playerBId: players[j].id,
        winnerId: null,
      });
    }
  }
  return matches;
}

/**
 * Build fixture for current players and preserve results from existing matches.
 * When a player is added, new matches (vs everyone else) are added. When a player is removed, their matches are dropped.
 * @param {Array<{ id: string, name: string }>} players
 * @param {Array<{ id: string, playerAId: string, playerBId: string, winnerId: string | null }>} existingMatches
 * @returns {Array<{ id: string, playerAId: string, playerBId: string, winnerId: string | null }>}
 */
export function syncFixtureToPlayers(players, existingMatches) {
  const resultKey = (a, b) => (a < b ? `${a}\n${b}` : `${b}\n${a}`);
  const existingByPair = new Map();
  for (const m of existingMatches) {
    const key = resultKey(m.playerAId, m.playerBId);
    existingByPair.set(key, m);
  }
  const newMatches = [];
  for (let i = 0; i < players.length; i++) {
    for (let j = i + 1; j < players.length; j++) {
      const key = resultKey(players[i].id, players[j].id);
      const existing = existingByPair.get(key);
      newMatches.push(
        existing
          ? { ...existing }
          : {
              id: generateId(),
              playerAId: players[i].id,
              playerBId: players[j].id,
              winnerId: null,
            }
      );
    }
  }
  return newMatches;
}

/**
 * Compute league standings from players and matches.
 * @param {Array<{ id: string, name: string }>} players
 * @param {Array<{ playerAId: string, playerBId: string, winnerId: string | null }>} matches
 * @returns {Array<{ playerId: string, name: string, wins: number, losses: number }>} sorted by wins desc
 */
export function computeStandings(players, matches) {
  const byId = Object.fromEntries(players.map((p) => [p.id, { ...p, wins: 0, losses: 0 }]));

  for (const m of matches) {
    if (!m.winnerId) continue;
    if (byId[m.playerAId]) {
      if (m.winnerId === m.playerAId) byId[m.playerAId].wins += 1;
      else byId[m.playerAId].losses += 1;
    }
    if (byId[m.playerBId]) {
      if (m.winnerId === m.playerBId) byId[m.playerBId].wins += 1;
      else byId[m.playerBId].losses += 1;
    }
  }

  return Object.values(byId)
    .map(({ id, name, wins, losses }) => ({ playerId: id, name, wins, losses }))
    .sort((a, b) => b.wins - a.wins);
}
