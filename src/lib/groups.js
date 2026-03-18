import { generateId } from './fixture';

const PLAYERS_PER_GROUP = 4;

/** Valid total player counts for group phase: 8, 16, 32 (so 2, 4, or 8 groups → knockout size 2, 4, 8). */
export const VALID_GROUP_PHASE_SIZES = [8, 16, 32];

export function canStartGroupPhase(playerCount) {
  return VALID_GROUP_PHASE_SIZES.includes(playerCount);
}

/**
 * Create groups of 4 from a list of players (order preserved: group 1 = first 4, etc.).
 * @param {Array<{ id: string, name: string }>} players
 * @returns {Array<{ id: string, name: string, playerIds: string[] }>} or null if count not valid
 */
export function createGroups(players) {
  if (!canStartGroupPhase(players.length)) return null;
  const groups = [];
  for (let i = 0; i < players.length; i += PLAYERS_PER_GROUP) {
    const slice = players.slice(i, i + PLAYERS_PER_GROUP);
    groups.push({
      id: generateId(),
      name: `Group ${groups.length + 1}`,
      playerIds: slice.map((p) => p.id),
    });
  }
  return groups;
}

/**
 * Generate round-robin matches for one group (each pair plays once).
 * @param {{ id: string, playerIds: string[] }} group
 * @returns {Array<{ id: string, groupId: string, playerAId: string, playerBId: string, winnerId: string | null }>}
 */
export function groupRoundRobinMatches(group) {
  const matches = [];
  const ids = group.playerIds;
  for (let i = 0; i < ids.length; i++) {
    for (let j = i + 1; j < ids.length; j++) {
      matches.push({
        id: generateId(),
        groupId: group.id,
        playerAId: ids[i],
        playerBId: ids[j],
        winnerId: null,
      });
    }
  }
  return matches;
}

/**
 * Generate all group matches for all groups. Preserve existing results by (groupId, playerAId, playerBId).
 */
export function buildGroupMatches(groups, existingGroupMatches = []) {
  const key = (gid, a, b) => `${gid}\n${a}\n${b}`;
  const byKey = new Map();
  for (const m of existingGroupMatches) {
    if (m.groupId) byKey.set(key(m.groupId, m.playerAId, m.playerBId), m);
  }
  const out = [];
  for (const group of groups) {
    const ids = group.playerIds;
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        const k = key(group.id, ids[i], ids[j]);
        const existing = byKey.get(k);
        out.push(
          existing
            ? { ...existing }
            : {
                id: generateId(),
                groupId: group.id,
                playerAId: ids[i],
                playerBId: ids[j],
                winnerId: null,
              }
        );
      }
    }
  }
  return out;
}

/**
 * Standings for one group: wins per player, sorted by wins desc, then head-to-head for ties.
 * @param {string[]} playerIds
 * @param {Array<{ playerAId: string, playerBId: string, winnerId: string | null }>} matches (for this group only)
 * @returns {Array<{ playerId: string, wins: number }>} sorted, best first
 */
export function groupStandings(playerIds, matches) {
  const wins = Object.fromEntries(playerIds.map((id) => [id, 0]));
  for (const m of matches) {
    if (m.winnerId && wins[m.winnerId] !== undefined) wins[m.winnerId] += 1;
  }
  const list = playerIds.map((playerId) => ({ playerId, wins: wins[playerId] }));

  // Sort by wins desc, then by head-to-head between tied players
  list.sort((a, b) => {
    if (b.wins !== a.wins) return b.wins - a.wins;
    const h2h = headToHeadWinner(a.playerId, b.playerId, matches);
    if (h2h === a.playerId) return -1;
    if (h2h === b.playerId) return 1;
    return 0;
  });
  return list;
}

function headToHeadWinner(playerAId, playerBId, matches) {
  const m = matches.find(
    (x) =>
      (x.playerAId === playerAId && x.playerBId === playerBId) ||
      (x.playerAId === playerBId && x.playerBId === playerAId)
  );
  return m?.winnerId || null;
}

/**
 * Get 1st place player id per group (in group order). Uses groupStandings so tie-break is applied.
 */
export function getGroupWinners(groups, groupMatches) {
  const winners = [];
  for (const group of groups) {
    const groupOnly = groupMatches.filter((m) => m.groupId === group.id);
    const standings = groupStandings(group.playerIds, groupOnly);
    winners.push(standings[0]?.playerId ?? null);
  }
  return winners;
}

/**
 * Get full standings per group for display: array of { groupId, groupName, standings: [{ playerId, wins }] }.
 */
export function getAllGroupStandings(groups, groupMatches, playersById) {
  return groups.map((g) => {
    const groupOnly = groupMatches.filter((m) => m.groupId === g.id);
    const standings = groupStandings(g.playerIds, groupOnly);
    return {
      groupId: g.id,
      groupName: g.name,
      standings: standings.map((s) => ({
        playerId: s.playerId,
        name: playersById[s.playerId]?.name ?? '—',
        wins: s.wins,
      })),
    };
  });
}
