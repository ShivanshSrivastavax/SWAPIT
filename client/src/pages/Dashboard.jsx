import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import { getLeaderboard, getHistory } from '../store/useGameStore'

export default function Dashboard() {
  const user = useAuthStore((s) => s.user)
  const [stats, setStats] = useState(null)
  const [recent, setRecent] = useState([])

  useEffect(() => {
    let cancelled = false
    getLeaderboard()
      .then((rows) => {
        if (!cancelled) setStats(rows.find((s) => s.username === user?.username) || null)
      })
      .catch(() => {})
    getHistory()
      .then((history) => {
        if (!cancelled) setRecent(history.slice(0, 3))
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [user?.username])

  return (
    <div className="max-w-5xl mx-auto px-5 py-10">
      <h1 className="font-display font-extrabold text-3xl mb-1">Welcome, {user?.username}</h1>
      <p className="text-cream/60 mb-8">Ready for a round of SwapIt?</p>

      <div className="grid sm:grid-cols-3 gap-4 mb-10">
        <StatCard label="Wins" value={stats?.wins ?? 0} />
        <StatCard label="Games played" value={stats?.gamesPlayed ?? 0} />
        <StatCard label="Win rate" value={`${stats?.winRate ?? 0}%`} />
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-10">
        <ActionCard
          to="/rooms/create"
          title="Create a room"
          desc="Start a new table and invite others (or play vs bots)."
          color="bg-card-red"
        />
        <ActionCard
          to="/rooms/join"
          title="Join a room"
          desc="Enter a room code to join an existing table."
          color="bg-card-blue"
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <ActionCard to="/leaderboard" title="Leaderboard" desc="See how you rank." color="bg-card-green" small />
        <ActionCard to="/history" title="Match history" desc="Review your past games." color="bg-card-yellow" small dark />
      </div>

      {recent.length > 0 && (
        <div className="mt-10">
          <h2 className="font-display font-bold text-xl mb-3">Recent matches</h2>
          <div className="space-y-2">
            {recent.map((g) => (
              <div key={g.id} className="flex items-center justify-between bg-felt-dark/50 border border-cream/10 rounded-xl px-4 py-3 text-sm">
                <span>Room {g.roomCode}</span>
                <span className="text-cream/60">Winner: {g.winner}</span>
                <span className="text-cream/40">{new Date(g.endedAt).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-xl border border-cream/10 bg-felt-dark/50 px-5 py-4">
      <p className="text-xs uppercase tracking-wide text-cream/50">{label}</p>
      <p className="font-display font-extrabold text-2xl mt-1">{value}</p>
    </div>
  )
}

function ActionCard({ to, title, desc, color, small, dark }) {
  return (
    <Link
      to={to}
      className={`group rounded-xl border border-cream/10 bg-felt-dark/50 hover:bg-felt-dark/80 transition-colors overflow-hidden ${small ? 'p-4' : 'p-6'}`}
    >
      <div className={`w-10 h-10 rounded-lg ${color} shadow-card mb-3 group-hover:scale-105 transition-transform`} />
      <p className={`font-display font-bold ${small ? 'text-base' : 'text-xl'} ${dark ? '' : ''}`}>{title}</p>
      <p className="text-sm text-cream/60 mt-1">{desc}</p>
    </Link>
  )
}
