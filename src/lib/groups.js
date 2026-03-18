import { generateId } from './fixture';

const MIN_PER_GROUP = 2;
const MAX_PER_GROUP = 4;

/** Human-readable hint for valid group phase sizes (no longer just 8, 16, 32). */
export const GROUP_PHASE_SIZE_HINT = '4–8, 8–16, or 16–32 players (up to 4 per group)';

/** Valid: 2, 4, or 8 groups with 2–4 players each → 4–8, 8–16, or 16–32 players. No more power-of-2-only limit. */
export function canStartGroupPhase(playerCount) {
  if (playerCount < 4 || playerCount > 32) return false;
  const numGroups = getNumGroups(playerCount);
  if (!numGroups) return false;
  const minTotal = numGroups * MIN_PER_GROUP;
  const maxTotal = numGroups * MAX_PER_GROUP;
  return playerCount >= minTotal && playerCount <= maxTotal;
}

/** Number of groups (2, 4, or 8) for a given player count, or null if invalid. */
function getNumGroups(playerCount) {
  if (playerCount >= 16 && playerCount <= 32) return 8;
  if (playerCount >= 8 && playerCount <= 16) return 4;
  if (playerCount >= 4 && playerCount <= 8) return 2;
  return null;
}

/**
 * Create groups with 2–4 players each (evenly distributed). 2, 4, or 8 groups so knockout is 2/4/8.
 * @param {Array<{ id: string, name: string }>} players
 * @returns {Array<{ id: string, name: string, playerIds: string[] }>} or null if count not valid
 */
export function createGroups(players) {
  if (!canStartGroupPhase(players.length)) return null;
  const n = players.length;
  const numGroups = getNumGroups(n);
  const baseSize = Math.floor(n / numGroups);
  const remainder = n % numGroups;
  const groups = [];
  let idx = 0;
  for (let g = 0; g < numGroups; g++) {
    const size = baseSize + (g < remainder ? 1 : 0);
    const slice = players.slice(idx, idx + size);
    idx += size;
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
