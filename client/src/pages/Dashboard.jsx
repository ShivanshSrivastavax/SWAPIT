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
      {/* Hero Welcome Banner */}
      <div className="glass-panel rounded-3xl p-8 mb-10 border border-cream/15 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-gradient-to-br from-card-yellow/20 via-card-red/20 to-transparent rounded-full blur-3xl pointer-events-none" />
        <h1 className="font-display font-black text-4xl sm:text-5xl mb-2 tracking-wide">
          Welcome, <span className="bg-gradient-to-r from-card-yellow to-amber-400 bg-clip-text text-transparent">{user?.username}</span>
        </h1>
        <p className="text-cream/70 text-lg max-w-xl font-medium">
          Ready for a round of real-time multiplayer UNO (SwapIt)? Host a room, invite friends, or test your skills against AI bots!
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid sm:grid-cols-3 gap-5 mb-10">
        <StatCard label="Wins" value={stats?.wins ?? 0} icon="🏆" color="from-amber-400 to-yellow-600" />
        <StatCard label="Games played" value={stats?.gamesPlayed ?? 0} icon="🎮" color="from-sky-400 to-blue-600" />
        <StatCard label="Win rate" value={`${stats?.winRate ?? 0}%`} icon="🔥" color="from-emerald-400 to-teal-600" />
      </div>

      {/* Primary Actions */}
      <div className="grid sm:grid-cols-2 gap-6 mb-10">
        <ActionCard
          to="/rooms/create"
          title="Create a room"
          desc="Start a new custom table and invite friends or add competitive AI bots."
          badge="HOST TABLE"
          gradient="from-card-red via-red-600 to-rose-700"
          icon="➕"
        />
        <ActionCard
          to="/rooms/join"
          title="Join a room"
          desc="Enter a unique room code to jump straight into an active match."
          badge="MULTIPLAYER"
          gradient="from-card-blue via-blue-600 to-indigo-800"
          icon="🚀"
        />
      </div>

      {/* Secondary Actions */}
      <div className="grid sm:grid-cols-2 gap-6 mb-10">
        <ActionCard to="/leaderboard" title="Leaderboard" desc="View top ranked players globally." gradient="from-card-green to-emerald-800" icon="👑" small />
        <ActionCard to="/history" title="Match history" desc="Review your previous game outcomes." gradient="from-card-yellow to-amber-600" icon="📜" small />
      </div>

      {/* Recent Matches */}
      {recent.length > 0 && (
        <div className="glass-panel rounded-2xl p-6 border border-cream/10">
          <h2 className="font-display font-black text-2xl mb-4 flex items-center gap-2">
            <span>⚔️</span> Recent Matches
          </h2>
          <div className="space-y-3">
            {recent.map((g) => (
              <div key={g.id} className="flex items-center justify-between bg-felt-dark/60 border border-cream/10 rounded-xl px-5 py-3 text-sm hover:border-card-yellow/30 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <span className="font-bold text-cream">Room {g.roomCode}</span>
                </div>
                <span className="text-cream/80 font-semibold">Winner: <strong className="text-card-yellow">{g.winner}</strong></span>
                <span className="text-cream/40 text-xs font-mono">{new Date(g.endedAt).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, icon, color }) {
  return (
    <div className="glass-panel rounded-2xl p-5 border border-cream/10 relative overflow-hidden group hover:border-card-yellow/40 transition-all duration-300">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs uppercase font-extrabold tracking-wider text-cream/60">{label}</p>
        <span className="text-xl">{icon}</span>
      </div>
      <p className={`font-display font-black text-3xl bg-gradient-to-r ${color} bg-clip-text text-transparent`}>{value}</p>
    </div>
  )
}

function ActionCard({ to, title, desc, gradient, icon, small, badge }) {
  return (
    <Link
      to={to}
      className={`group glass-panel-interactive rounded-2xl border border-cream/10 flex flex-col justify-between relative overflow-hidden ${small ? 'p-5' : 'p-7'}`}
    >
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} shadow-lg flex items-center justify-center text-xl text-cream group-hover:scale-110 transition-transform duration-300`}>
            {icon}
          </div>
          {badge && (
            <span className="text-[0.65rem] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-cream/10 border border-cream/20 text-cream/90">
              {badge}
            </span>
          )}
        </div>
        <p className={`font-display font-extrabold ${small ? 'text-xl' : 'text-2xl'} mb-1 group-hover:text-card-yellow transition-colors`}>{title}</p>
        <p className="text-sm text-cream/70 font-medium leading-relaxed">{desc}</p>
      </div>
    </Link>
  )
}
