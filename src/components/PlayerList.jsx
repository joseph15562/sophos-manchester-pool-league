import { useState } from 'react';
import { generateId } from '../lib/fixture';

export default function PlayerList({ players, onPlayersChange, locked }) {
  const [name, setName] = useState('');

  function handleAdd(e) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onPlayersChange([
      ...players,
      { id: generateId(), name: trimmed },
    ]);
    setName('');
  }

  function handleRemove(id) {
    onPlayersChange(players.filter((p) => p.id !== id));
  }

  return (
    <section className={`panel league-players ${locked ? 'panel--locked' : ''}`}>
      <h2>League players</h2>
      {locked && <p className="locked-hint">Locked – unlock to add or remove players.</p>}
      <form onSubmit={handleAdd} className="add-player-form">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Player name"
          aria-label="Player name"
          className="input"
          disabled={locked}
        />
        <button type="submit" className="btn btn-primary" disabled={locked}>
          Add player
        </button>
      </form>
      {players.length === 0 ? (
        <p className="empty">Add at least 2 players to generate the league fixture.</p>
      ) : (
        <ul className="player-list">
          {players.map((p) => (
            <li key={p.id} className="player-item">
              <span className="player-name">{p.name}</span>
              <button
                type="button"
                onClick={() => handleRemove(p.id)}
                className="btn btn-ghost btn-sm"
                aria-label={`Remove ${p.name}`}
                disabled={locked}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
