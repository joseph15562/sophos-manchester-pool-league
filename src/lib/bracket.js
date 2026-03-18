import { generateId } from './fixture';

/**
 * Next power of 2 >= n (for bracket size).
 */
function nextPower2(n) {
  if (n <= 1) return 1;
  let p = 1;
  while (p < n) p *= 2;
  return p;
}

/** True if n is exactly 2, 4, 8, 16, 32, ... (so no byes in the bracket). */
export function isBracketSizeValid(playerCount) {
  if (playerCount < 2) return false;
  const p = nextPower2(playerCount);
  return p === playerCount;
}

/** Valid bracket sizes for messaging (e.g. "4, 8, 16, or 32"). */
export const VALID_BRACKET_SIZES = [2, 4, 8, 16, 32];

/**
 * Generate a single-elimination bracket from a list of players.
 * Only use when player count is a power of 2 so every match is player vs player (no byes).
 * @param {Array<{ id: string, name: string }>} players
 * @returns {{ rounds: Array<{ matches: Array<{ id: string, playerAId: string | null, playerBId: string | null, winnerId: string | null }> }> }} or null if count not valid
 */
export function generateBracket(players) {
  if (!isBracketSizeValid(players.length)) return null;
  const numSlots = players.length;
  const numMatchesR0 = numSlots / 2;
  const numRounds = Math.log2(numSlots);

  const rounds = [];

  // Round 0: every match is player vs player (numSlots === players.length)
  const round0Matches = [];
  for (let i = 0; i < numMatchesR0; i++) {
    const slotA = 2 * i;
    const slotB = 2 * i + 1;
    round0Matches.push({
      id: generateId(),
      playerAId: players[slotA].id,
      playerBId: players[slotB].id,
      winnerId: null,
    });
  }
  rounds.push({ matches: round0Matches });

  // Rounds 1 .. final: empty slots (filled as winners advance). Stop at numRounds - 1 so we don't add an extra round after the real final.
  let matchesInRound = numMatchesR0 / 2;
  for (let r = 1; r < numRounds; r++) {
    const matches = [];
    for (let i = 0; i < matchesInRound; i++) {
      matches.push({
        id: generateId(),
        playerAId: null,
        playerBId: null,
        winnerId: null,
      });
    }
    rounds.push({ matches });
    matchesInRound /= 2;
  }

  return { rounds };
}

/**
 * Set winner for a match and advance them to the next round slot (or clear slot if winnerId is null).
 * Mutates bracket in place; returns updated bracket.
 */
export function setBracketWinner(bracket, roundIndex, matchIndex, winnerId) {
  const rounds = bracket.rounds;
  const match = rounds[roundIndex].matches[matchIndex];
  match.winnerId = winnerId;

  const nextRoundIndex = roundIndex + 1;
  if (nextRoundIndex >= rounds.length) return bracket;

  const nextMatchIndex = Math.floor(matchIndex / 2);
  const slot = matchIndex % 2 === 0 ? 'playerAId' : 'playerBId';
  rounds[nextRoundIndex].matches[nextMatchIndex][slot] = winnerId;
  return bracket;
}

/**
 * Get round label for display (e.g. "Round of 16", "Quarter Final", "Final").
 */
export function getRoundLabel(roundIndex, totalRounds) {
  const numMatches = 2 ** (totalRounds - 1 - roundIndex);
  if (numMatches === 1) return 'FINAL';
  if (numMatches === 2) return 'SEMI-FINAL';
  if (numMatches === 4) return 'QUARTER FINAL';
  return `ROUND of ${numMatches * 2}`;
}
