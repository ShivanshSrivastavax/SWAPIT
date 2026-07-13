export default function ScoreBoard({ rows }) {
  if (rows.length === 0) {
    return (
      <div className="text-center py-12 text-cream/50">
        <p className="font-display text-lg mb-1">No games played yet</p>
        <p className="text-sm">Finish a match to appear on the leaderboard.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-cream/10">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-felt-dark/70 text-cream/60 text-left uppercase text-xs tracking-wide">
            <th className="px-4 py-3">#</th>
            <th className="px-4 py-3">Player</th>
            <th className="px-4 py-3 text-right">Wins</th>
            <th className="px-4 py-3 text-right">Losses</th>
            <th className="px-4 py-3 text-right">Played</th>
            <th className="px-4 py-3 text-right">Win rate</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.username + i} className="border-t border-cream/10 hover:bg-cream/5">
              <td className="px-4 py-3 font-display font-bold text-card-yellow">{i + 1}</td>
              <td className="px-4 py-3 font-medium">{r.username}</td>
              <td className="px-4 py-3 text-right">{r.wins}</td>
              <td className="px-4 py-3 text-right">{r.losses}</td>
              <td className="px-4 py-3 text-right">{r.gamesPlayed}</td>
              <td className="px-4 py-3 text-right font-semibold">{r.winRate}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
