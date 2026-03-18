import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PlayerList from '../components/PlayerList';
import BracketPanel from '../components/BracketPanel';
import PinLockBar from '../components/PinLockBar';
import { loadState, saveState } from '../lib/storage';
import { getLocked } from '../lib/pinLock';
import '../App.css';

export default function MainPage() {
  const [players, setPlayers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [bracket, setBracket] = useState(null);
  const [locked, setLocked] = useState(getLocked());

  useEffect(() => {
    const state = loadState();
    setPlayers(state.players);
    setMatches(state.matches ?? []);
    setBracket(state.bracket);
  }, []);

  useEffect(() => {
    saveState(players, matches, bracket);
  }, [players, matches, bracket]);

  return (
    <div className="app">
      <header className="app-header">
        <h1>Sophos Manchester Pool League</h1>
        <div className="app-header-actions">
          <PinLockBar onLockChange={setLocked} />
          <Link to="/display" target="_blank" rel="noopener noreferrer" className="display-link">
            Open display board (TV)
          </Link>
        </div>
      </header>
      <main className="app-main">
        <PlayerList players={players} onPlayersChange={setPlayers} locked={locked} />
        <BracketPanel
          players={players}
          bracket={bracket}
          onBracketChange={setBracket}
          locked={locked}
        />
      </main>
    </div>
  );
}
