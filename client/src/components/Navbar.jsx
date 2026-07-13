import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'

export default function Navbar() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()

  return (
    <nav className="sticky top-0 z-40 backdrop-blur bg-felt-dark/70 border-b border-cream/10">
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
        <Link to={user ? '/dashboard' : '/'} className="flex items-center gap-2 group">
          <img
            src="/swapit_icon_mark.svg"
            alt="SwapIt logo"
            className="h-24 w-auto rounded-lg object-contain"
          />
          <span className="font-display font-extrabold text-xl tracking-wide">SWAPIT</span>
        </Link>

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
              className="ml-2 px-3 py-1.5 rounded-lg text-sm font-semibold bg-cream/10 hover:bg-cream/20 transition-colors focus-ring"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link to="/login" className="px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-cream/10 transition-colors">
              Log in
            </Link>
            <Link
              to="/register"
              className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-card-yellow text-felt-dark hover:brightness-95 transition"
            >
              Sign up
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}

function NavLink({ to, children }) {
  return (
    <Link
      to={to}
      className="hidden sm:inline-block px-3 py-1.5 rounded-lg text-sm font-semibold text-cream/80 hover:text-cream hover:bg-cream/10 transition-colors"
    >
      {children}
    </Link>
  )
}
