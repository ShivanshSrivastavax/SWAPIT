import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import { sound } from '../utils/soundEffects'

export default function Navbar() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()
  const [muted, setMuted] = useState(sound.isMuted())

  const toggleMute = () => {
    const next = !muted
    sound.setMuted(next)
    setMuted(next)
  }

  return (
    <nav className="sticky top-0 z-40 backdrop-blur-md bg-felt-dark/80 border-b border-cream/15 shadow-md">
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
        <Link to={user ? '/dashboard' : '/'} className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-card-red via-card-yellow to-card-blue p-0.5 shadow-lg group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-felt-dark rounded-[10px] flex items-center justify-center font-display font-black text-card-yellow text-sm">
              S
            </div>
          </div>
          <span className="font-display font-black text-xl tracking-wider bg-gradient-to-r from-cream via-amber-200 to-card-yellow bg-clip-text text-transparent">
            SWAPIT
          </span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-4">
          {/* Audio Mute Toggle Button */}
          <button
            type="button"
            onClick={toggleMute}
            className="p-2 rounded-xl bg-felt-dark/60 border border-cream/15 text-cream/80 hover:text-cream hover:bg-cream/10 transition-colors"
            title={muted ? 'Unmute Sound FX' : 'Mute Sound FX'}
          >
            {muted ? '🔇' : '🔊'}
          </button>

          {user ? (
            <div className="flex items-center gap-1 sm:gap-3">
              <NavLink to="/dashboard">Dashboard</NavLink>
              <NavLink to="/leaderboard">Leaderboard</NavLink>
              <NavLink to="/history">History</NavLink>
              <NavLink to="/profile">Profile</NavLink>
              <button
                onClick={async () => {
                  await logout()
                  navigate('/login')
                }}
                className="ml-2 px-3.5 py-1.5 rounded-xl text-xs font-extrabold uppercase tracking-wide bg-cream/10 border border-cream/15 hover:bg-card-red/80 hover:border-red-400 transition-all duration-200"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="px-4 py-2 rounded-xl text-sm font-extrabold hover:bg-cream/10 transition-colors"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 rounded-xl text-sm font-extrabold bg-gradient-to-r from-card-yellow to-amber-500 text-felt-dark shadow-md hover:brightness-110 transition-transform active:scale-95"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

function NavLink({ to, children }) {
  return (
    <Link
      to={to}
      className="hidden sm:inline-block px-3.5 py-1.5 rounded-xl text-sm font-bold text-cream/80 hover:text-cream hover:bg-cream/10 transition-colors"
    >
      {children}
    </Link>
  )
}
