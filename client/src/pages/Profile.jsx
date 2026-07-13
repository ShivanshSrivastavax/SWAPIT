import { useEffect, useState } from 'react'
import { useAuthStore } from '../store/useAuthStore'
import { getLeaderboard } from '../store/useGameStore'

export default function Profile() {
  const user = useAuthStore((s) => s.user)
  const updateProfile = useAuthStore((s) => s.updateProfile)
  const [username, setUsername] = useState(user?.username || '')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [stats, setStats] = useState(null)

  useEffect(() => {
    let cancelled = false
    getLeaderboard()
      .then((rows) => {
        if (!cancelled) setStats(rows.find((s) => s.username === user?.username) || null)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [user?.username])

  async function handleSave(e) {
    e.preventDefault()
    setError('')
    const updates = {}
    if (username && username !== user?.username) updates.username = username
    if (password) updates.password = password
    try {
      await updateProfile(updates)
      setPassword('')
      setMessage('Profile updated.')
      setTimeout(() => setMessage(''), 2000)
    } catch (err) {
      setError(err.message || 'Could not update profile.')
    }
  }

  return (
    <div className="max-w-md mx-auto px-5 py-10">
      <h1 className="font-display font-extrabold text-3xl mb-1">Profile</h1>
      <p className="text-cream/60 mb-8 text-sm">Manage your account details.</p>

      <div className="rounded-xl border border-cream/10 bg-felt-dark/50 p-5 mb-6 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-card-blue flex items-center justify-center font-display font-extrabold text-xl">
          {user?.username?.[0]?.toUpperCase()}
        </div>
        <div>
          <p className="font-semibold">{user?.username}</p>
          <p className="text-sm text-cream/60">{user?.email}</p>
          <p className="text-xs text-cream/50 mt-1">
            {stats ? `${stats.wins} wins · ${stats.gamesPlayed} games played` : 'No games played yet'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="bg-felt-dark/50 border border-cream/10 rounded-2xl p-6 space-y-4">
        {message && <p className="text-sm bg-card-green/20 border border-card-green/40 rounded-lg px-3 py-2">{message}</p>}
        {error && <p className="text-sm bg-card-red/20 border border-card-red/40 rounded-lg px-3 py-2">{error}</p>}
        <label className="block">
          <span className="text-sm font-medium text-cream/80">Username</span>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mt-1 w-full rounded-lg bg-cream/10 px-3 py-2 focus-ring"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-cream/80">New password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Leave blank to keep current password"
            className="mt-1 w-full rounded-lg bg-cream/10 px-3 py-2 placeholder:text-cream/30 focus-ring"
          />
        </label>
        <button
          type="submit"
          className="w-full py-2.5 rounded-xl bg-card-yellow text-felt-dark font-semibold hover:brightness-95 transition"
        >
          Save changes
        </button>
      </form>
    </div>
  )
}
