import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PlayerList from '../components/PlayerList';
import BracketPanel from '../components/BracketPanel';
import { loadState, saveState } from '../lib/storage';
import '../App.css';

export default function MainPage() {
  const [players, setPlayers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [bracket, setBracket] = useState(null);

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
        <Link to="/display" target="_blank" rel="noopener noreferrer" className="display-link">
          Open display board (TV)
        </Link>
      </header>
      <main className="app-main">
        <PlayerList players={players} onPlayersChange={setPlayers} />
        <BracketPanel
          players={players}
          bracket={bracket}
          onBracketChange={setBracket}
        />
      </main>
    </div>
  );
}
