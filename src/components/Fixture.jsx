export default function Fixture({ players, matches, onMatchesChange }) {
  const hasFixture = players.length >= 2 && matches.length > 0;

  function handleClearResults() {
    if (!window.confirm('Clear all results? You can record them again.')) return;
    onMatchesChange(matches.map((m) => ({ ...m, winnerId: null })));
  }

  function setWinner(matchId, winnerId) {
    onMatchesChange(
      matches.map((m) => (m.id === matchId ? { ...m, winnerId } : m))
    );
  }

  const getPlayerName = (id) => players.find((p) => p.id === id)?.name ?? '—';

  return (
    <section className="panel league-fixture">
      <h2>League fixture</h2>
      {!hasFixture ? (
        <p className="hint">
          Add at least 2 players to the league. The fixture will appear here and update automatically when you add or remove players.
        </p>
      ) : (
        <>
          <p className="hint">Everyone plays everyone once. New matches are added when you add a player.</p>
          <button
            type="button"
            onClick={handleClearResults}
            className="btn btn-ghost btn-sm"
          >
            Clear all results
          </button>
          <ul className="match-list">
            {matches.map((m) => (
              <li key={m.id} className="match-item">
                <span className="match-vs">
                  {getPlayerName(m.playerAId)} vs {getPlayerName(m.playerBId)}
                </span>
                <div className="match-result">
                  <button
                    type="button"
                    onClick={() => setWinner(m.id, m.playerAId)}
                    className={`btn btn-sm ${m.winnerId === m.playerAId ? 'btn-primary' : 'btn-ghost'}`}
                    title={`${getPlayerName(m.playerAId)} wins`}
                  >
                    {getPlayerName(m.playerAId)} wins
                  </button>
                  <button
                    type="button"
                    onClick={() => setWinner(m.id, null)}
                    className="btn btn-ghost btn-sm"
                    title="No result yet"
                  >
                    —
                  </button>
                  <button
                    type="button"
                    onClick={() => setWinner(m.id, m.playerBId)}
                    className={`btn btn-sm ${m.winnerId === m.playerBId ? 'btn-primary' : 'btn-ghost'}`}
                    title={`${getPlayerName(m.playerBId)} wins`}
                  >
                    {getPlayerName(m.playerBId)} wins
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
