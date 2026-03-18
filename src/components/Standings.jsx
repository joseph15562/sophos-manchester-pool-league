import { computeStandings } from '../lib/fixture';

export default function Standings({ players, matches }) {
  const standings = computeStandings(players, matches);

  if (players.length === 0) {
    return (
      <section className="panel league-table">
        <h2>League table</h2>
        <p className="empty">Add players and generate the fixture to see standings.</p>
      </section>
    );
  }

  return (
    <section className="panel league-table">
      <h2>League table</h2>
      <div className="table-wrap">
        <table className="standings-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Player</th>
              <th>Wins</th>
              <th>Losses</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((row, i) => (
              <tr key={row.playerId}>
                <td>{i + 1}</td>
                <td className="player-name">{row.name}</td>
                <td>{row.wins}</td>
                <td>{row.losses}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
