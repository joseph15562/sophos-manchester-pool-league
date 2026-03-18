import { generateBracket, setBracketWinner, getRoundLabel, isBracketSizeValid, VALID_BRACKET_SIZES } from '../lib/bracket';

export default function BracketPanel({ players, bracket, onBracketChange, locked }) {
  const getPlayerName = (id) => (id ? players.find((p) => p.id === id)?.name ?? '—' : 'BYE');

  function handleGenerate() {
    if (!isBracketSizeValid(players.length)) return;
    const newBracket = generateBracket(players);
    if (newBracket) onBracketChange(newBracket);
  }

  function handleSetWinner(roundIndex, matchIndex, winnerId) {
    const next = JSON.parse(JSON.stringify(bracket));
    setBracketWinner(next, roundIndex, matchIndex, winnerId);
    onBracketChange(next);
  }

  function handleClearBracket() {
    if (!window.confirm('Clear the whole bracket? You can generate a new one.')) return;
    onBracketChange(null);
  }

  if (bracket) {
    const totalRounds = bracket.rounds.length;
    return (
      <section className={`panel bracket-panel ${locked ? 'panel--locked' : ''}`}>
        <h2>Knockout bracket</h2>
        {locked && <p className="locked-hint">Locked – unlock to change results or clear bracket.</p>}
        <button type="button" onClick={handleClearBracket} className="btn btn-ghost btn-sm" disabled={locked}>
          Clear bracket
        </button>
        {bracket.rounds.map((round, roundIndex) => (
          <div key={roundIndex} className="bracket-round">
            <h3 className="bracket-round-title">
              {getRoundLabel(roundIndex, totalRounds)}
            </h3>
            <ul className="bracket-match-list">
              {round.matches.map((m, matchIndex) => (
                <li key={m.id} className="bracket-match-item">
                  <span className="bracket-match-vs">
                    {getPlayerName(m.playerAId)} vs {getPlayerName(m.playerBId)}
                  </span>
                  {(m.playerAId || m.playerBId) && (
                    <div className="match-result">
                      {m.playerAId && (
                        <button
                          type="button"
                          className={`btn btn-sm ${m.winnerId === m.playerAId ? 'btn-primary' : 'btn-ghost'}`}
                          onClick={() => handleSetWinner(roundIndex, matchIndex, m.playerAId)}
                          disabled={locked}
                        >
                          {getPlayerName(m.playerAId)} wins
                        </button>
                      )}
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => handleSetWinner(roundIndex, matchIndex, null)}
                        disabled={locked}
                      >
                        —
                      </button>
                      {m.playerBId && (
                        <button
                          type="button"
                          className={`btn btn-sm ${m.winnerId === m.playerBId ? 'btn-primary' : 'btn-ghost'}`}
                          onClick={() => handleSetWinner(roundIndex, matchIndex, m.playerBId)}
                          disabled={locked}
                        >
                          {getPlayerName(m.playerBId)} wins
                        </button>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>
    );
  }

  const canGenerate = isBracketSizeValid(players.length);
  const sizeHint = VALID_BRACKET_SIZES.slice(0, -1).join(', ') + ' or ' + VALID_BRACKET_SIZES[VALID_BRACKET_SIZES.length - 1];

  return (
    <section className={`panel bracket-panel ${locked ? 'panel--locked' : ''}`}>
      <h2>Knockout bracket</h2>
      {locked && <p className="locked-hint">Locked – unlock to generate or change bracket.</p>}
      <p className="hint">
        Add players so you have exactly <strong>{sizeHint} players</strong>, then generate the bracket. That way every match is player vs player (no byes).
      </p>
      <button
        type="button"
        onClick={handleGenerate}
        disabled={!canGenerate || locked}
        className="btn btn-primary"
      >
        Generate bracket
      </button>
      {players.length > 0 && !canGenerate && (
        <p className="empty">
          You have {players.length} player{players.length !== 1 ? 's' : ''}. Need exactly {sizeHint} to generate (no byes).
        </p>
      )}
      {players.length === 0 && (
        <p className="empty">Add players first.</p>
      )}
    </section>
  );
}
