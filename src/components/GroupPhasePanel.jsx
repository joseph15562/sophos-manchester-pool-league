import {
  canStartGroupPhase,
  createGroups,
  buildGroupMatches,
  getGroupWinners,
  getAllGroupStandings,
  GROUP_PHASE_SIZE_HINT,
} from '../lib/groups';
import { generateBracket } from '../lib/bracket';

export default function GroupPhasePanel({
  players,
  groups,
  groupMatches,
  onGroupsChange,
  onGroupMatchesChange,
  bracket,
  onBracketChange,
  locked,
}) {
  const playersById = Object.fromEntries(players.map((p) => [p.id, p]));
  const getPlayerName = (id) => (id ? playersById[id]?.name ?? '—' : '—');

  function handleStartGroupPhase() {
    if (!canStartGroupPhase(players.length) || locked) return;
    const newGroups = createGroups(players);
    if (!newGroups) return;
    const newMatches = buildGroupMatches(newGroups, []);
    onGroupsChange(newGroups);
    onGroupMatchesChange(newMatches);
  }

  function handleSetGroupMatchWinner(matchId, winnerId) {
    const next = groupMatches.map((m) =>
      m.id === matchId ? { ...m, winnerId } : m
    );
    onGroupMatchesChange(next);
  }

  function handleGenerateKnockout() {
    if (!groups?.length || locked) return;
    const winnerIds = getGroupWinners(groups, groupMatches);
    const allResolved = winnerIds.every(Boolean);
    if (!allResolved) return;
    const winnerPlayers = winnerIds.map((id) => players.find((p) => p.id === id)).filter(Boolean);
    if (winnerPlayers.length !== groups.length) return;
    const newBracket = generateBracket(winnerPlayers);
    if (newBracket) onBracketChange(newBracket);
  }

  function handleClearGroups() {
    if (locked || !window.confirm('Clear all groups and group results? You can start the group phase again.')) return;
    onGroupsChange(null);
    onGroupMatchesChange([]);
  }

  const canGenerateKnockout =
    groups?.length &&
    getGroupWinners(groups, groupMatches).every(Boolean);

  // No groups yet: show start CTA
  if (!groups || groups.length === 0) {
    const canStart = canStartGroupPhase(players.length);
    return (
      <section className={`panel group-phase-panel ${locked ? 'panel--locked' : ''}`}>
        <h2>Group phase</h2>
        <p className="hint">
          Add <strong>{GROUP_PHASE_SIZE_HINT}</strong>. Groups have up to 4 players; everyone in each group plays everyone else once. 1st in each group qualifies for the knockout (no need for exactly 8, 16 or 32).
        </p>
        <button
          type="button"
          className="btn btn-primary"
          disabled={!canStart || locked}
          onClick={handleStartGroupPhase}
        >
          Start group phase
        </button>
        {players.length > 0 && !canStart && (
          <p className="empty">
            You have {players.length} players. Need {GROUP_PHASE_SIZE_HINT} for the group phase.
          </p>
        )}
      </section>
    );
  }

  // Groups exist: show standings and matches per group
  const standingsPerGroup = getAllGroupStandings(groups, groupMatches, playersById);

  return (
    <section className={`panel group-phase-panel ${locked ? 'panel--locked' : ''}`}>
      <h2>Group phase</h2>
      {locked && <p className="locked-hint">Locked – unlock to change results or clear groups.</p>}
      <button type="button" className="btn btn-ghost btn-sm" onClick={handleClearGroups} disabled={locked}>
        Clear groups
      </button>

      {standingsPerGroup.map(({ groupId, groupName, standings }) => (
        <div key={groupId} className="group-phase-group">
          <h3 className="group-phase-group-title">{groupName}</h3>
          <div className="group-phase-standings">
            <p className="group-phase-standings-label">Standings (1st qualifies)</p>
            <ol className="group-phase-standings-list">
              {standings.map((s, idx) => (
                <li key={s.playerId} className={idx === 0 ? 'group-phase-standings-first' : ''}>
                  {idx + 1}. {s.name} — {s.wins} win{s.wins !== 1 ? 's' : ''}
                </li>
              ))}
            </ol>
          </div>
          <div className="group-phase-matches">
            <p className="group-phase-matches-label">Matches</p>
            <ul className="group-phase-match-list">
              {groupMatches
                .filter((m) => m.groupId === groupId)
                .map((m) => (
                  <li key={m.id} className="group-phase-match-item">
                    <span className="group-phase-match-vs">
                      {getPlayerName(m.playerAId)} vs {getPlayerName(m.playerBId)}
                    </span>
                    <div className="match-result">
                      <button
                        type="button"
                        className={`btn btn-sm ${m.winnerId === m.playerAId ? 'btn-primary' : 'btn-ghost'}`}
                        onClick={() => handleSetGroupMatchWinner(m.id, m.playerAId)}
                        disabled={locked}
                      >
                        {getPlayerName(m.playerAId)} wins
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => handleSetGroupMatchWinner(m.id, null)}
                        disabled={locked}
                      >
                        —
                      </button>
                      <button
                        type="button"
                        className={`btn btn-sm ${m.winnerId === m.playerBId ? 'btn-primary' : 'btn-ghost'}`}
                        onClick={() => handleSetGroupMatchWinner(m.id, m.playerBId)}
                        disabled={locked}
                      >
                        {getPlayerName(m.playerBId)} wins
                      </button>
                    </div>
                  </li>
                ))}
            </ul>
          </div>
        </div>
      ))}

      <div className="group-phase-actions">
        <button
          type="button"
          className="btn btn-primary"
          disabled={!canGenerateKnockout || locked}
          onClick={handleGenerateKnockout}
        >
          Generate knockout from group winners
        </button>
        {!canGenerateKnockout && groups.length > 0 && (
          <p className="hint">Finish all group matches so each group has a clear 1st place, then generate the knockout.</p>
        )}
      </div>
    </section>
  );
}
