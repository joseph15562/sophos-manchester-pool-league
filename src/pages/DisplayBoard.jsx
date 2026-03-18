import { useState, useEffect, useCallback } from 'react';
import { loadState, STORAGE_KEY } from '../lib/storage';
import { getRoundLabel } from '../lib/bracket';
import './DisplayBoard.css';

function applyState(data, setPlayers, setBracket) {
  if (!data) return;
  setPlayers(Array.isArray(data.players) ? data.players : []);
  setBracket(data.bracket ?? null);
}

export default function DisplayBoard() {
  const [players, setPlayers] = useState([]);
  const [bracket, setBracket] = useState(null);

  const handleStorage = useCallback(
    (e) => {
      if (e.key !== STORAGE_KEY || !e.newValue) return;
      try {
        applyState(JSON.parse(e.newValue), setPlayers, setBracket);
      } catch {}
    },
    []
  );

  // Initial load from localStorage (same device)
  useEffect(() => {
    const state = loadState();
    applyState(state, setPlayers, setBracket);
  }, []);

  // Same device: listen for storage events
  useEffect(() => {
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [handleStorage]);

  // Other device (e.g. TV): poll API so TV updates when laptop changes
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const r = await fetch('/api/state');
        if (r.ok) {
          const data = await r.json();
          applyState(data, setPlayers, setBracket);
        }
      } catch {}
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const getPlayerName = (id) => (id ? players.find((p) => p.id === id)?.name ?? '—' : 'BYE');

  if (!bracket || !bracket.rounds?.length) {
    return (
      <div className="display-board">
        <div className="display-bg-gradient" aria-hidden="true" />
        <header className="display-header">
          <h1 className="display-title">SOPHOS MANCHESTER POOL LEAGUE</h1>
          <p className="display-subtitle">ROAD TO FINAL</p>
        </header>
        <p className="display-empty display-empty-center">
          Add players and generate the bracket on the main page. Everyone will appear in the first round; winners advance until one champion.
        </p>
      </div>
    );
  }

  const rounds = bracket.rounds;
  const totalRounds = rounds.length;
  const numR0 = rounds[0].matches.length;
  const halfR0 = Math.floor(numR0 / 2);

  // Left half: round 0 matches 0..halfR0-1, then round 1..final-1 (first half of each)
  // Right half: round 0 matches halfR0..numR0-1, then first half of each round
  const leftR0Matches = rounds[0].matches.slice(0, halfR0);
  const rightR0Matches = rounds[0].matches.slice(halfR0);

  const renderMatchBox = (m, roundIndex) => (
    <div key={m.id} className="bracket-display-match">
      <div className="bracket-display-slot bracket-display-slot-a">
        {m.playerAId ? (
          <span className={m.winnerId === m.playerAId ? 'bracket-display-winner' : ''}>
            {getPlayerName(m.playerAId)}
          </span>
        ) : (
          <span className="bracket-display-tbd">—</span>
        )}
      </div>
      <div className="bracket-display-vs">vs</div>
      <div className="bracket-display-slot bracket-display-slot-b">
        {m.playerBId ? (
          <span className={m.winnerId === m.playerBId ? 'bracket-display-winner' : ''}>
            {getPlayerName(m.playerBId)}
          </span>
        ) : (
          <span className="bracket-display-tbd">—</span>
        )}
      </div>
    </div>
  );

  const finalRound = rounds[totalRounds - 1];
  const finalMatch = finalRound.matches[0];

  return (
    <div className="display-board display-board-bracket">
      <div className="display-bg-gradient" aria-hidden="true" />
      <div className="display-bg-pattern" aria-hidden="true" />

      <header className="display-header">
        <h1 className="display-title">SOPHOS MANCHESTER POOL LEAGUE</h1>
        <p className="display-subtitle">ROAD TO FINAL · EVERYONE AT THE START · ELIMINATE AS IT GOES</p>
      </header>

      <div className="bracket-display-container">
        {/* Left side: first half of draw */}
        <div className="bracket-display-half bracket-display-left">
          <div className="bracket-display-round" data-round="0">
            <p className="bracket-display-round-label">
              {getRoundLabel(0, totalRounds)}
            </p>
            <div className="bracket-display-matches">
              {leftR0Matches.map((m) => renderMatchBox(m, 0))}
            </div>
          </div>
          {rounds.slice(1, totalRounds - 1).map((round, idx) => {
            const r = idx + 1;
            const half = Math.ceil(round.matches.length / 2);
            const leftMatches = round.matches.slice(0, half);
            return (
              <div key={r} className="bracket-display-round" data-round={r}>
                <p className="bracket-display-round-label">
                  {getRoundLabel(r, totalRounds)}
                </p>
                <div className="bracket-display-matches">
                  {leftMatches.map((m) => renderMatchBox(m, r))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Center: Final + trophy */}
        <div className="bracket-display-center">
          <div className="display-trophy-wrap">
            <svg
              className="display-trophy"
              viewBox="0 0 64 64"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path d="M12 8h40v12c0 11-9 20-20 20s-20-9-20-20V8zm4 4v8c0 8.8 7.2 16 16 16s16-7.2 16-16v-8H16z" fill="#EAB308" />
              <path d="M20 20h24v4H20v-4zm0 8h24v4H20v-4z" fill="#FDE047" />
              <path d="M28 40v20h8V40h-8z" fill="#EAB308" />
              <path d="M24 56h16v4H24v-4z" fill="#CA8A04" />
              <path d="M32 8V4h-4v8h8V8h-4z" fill="#EAB308" />
              <ellipse cx="32" cy="52" rx="12" ry="2" fill="#CA8A04" />
            </svg>
          </div>
          <p className="bracket-display-round-label bracket-display-final-label">FINAL</p>
          <div className="bracket-display-match bracket-display-final">
            <div className="bracket-display-slot">
              {finalMatch.playerAId ? (
                <span className={finalMatch.winnerId === finalMatch.playerAId ? 'bracket-display-winner' : ''}>
                  {getPlayerName(finalMatch.playerAId)}
                </span>
              ) : (
                <span className="bracket-display-tbd">—</span>
              )}
            </div>
            <div className="bracket-display-vs">vs</div>
            <div className="bracket-display-slot">
              {finalMatch.playerBId ? (
                <span className={finalMatch.winnerId === finalMatch.playerBId ? 'bracket-display-winner' : ''}>
                  {getPlayerName(finalMatch.playerBId)}
                </span>
              ) : (
                <span className="bracket-display-tbd">—</span>
              )}
            </div>
          </div>
        </div>

        {/* Right side: second half of draw, mirrored (R16 far right → QF → SF next to center) */}
        <div className="bracket-display-half bracket-display-right">
          <div className="bracket-display-round" data-round="0">
            <p className="bracket-display-round-label">
              {getRoundLabel(0, totalRounds)}
            </p>
            <div className="bracket-display-matches">
              {rightR0Matches.map((m) => renderMatchBox(m, 0))}
            </div>
          </div>
          {rounds.slice(1, totalRounds - 1).map((round, idx) => {
            const r = idx + 1;
            const half = Math.ceil(round.matches.length / 2);
            const rightMatches = round.matches.slice(half);
            return (
              <div key={r} className="bracket-display-round" data-round={r}>
                <p className="bracket-display-round-label">
                  {getRoundLabel(r, totalRounds)}
                </p>
                <div className="bracket-display-matches">
                  {rightMatches.map((m) => renderMatchBox(m, r))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Round labels bar at bottom (like the reference) */}
      <div className="bracket-display-footer">
        {rounds.map((_, idx) => (
          <span key={idx} className="bracket-display-footer-label">
            {getRoundLabel(idx, totalRounds)}
          </span>
        ))}
      </div>
    </div>
  );
}
