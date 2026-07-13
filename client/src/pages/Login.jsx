import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'

export default function Login() {
  const login = useAuthStore((s) => s.login)
  const navigate = useNavigate()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!identifier || !password) {
      setError('Enter both username/email and password.')
      return
    }
    setLoading(true)
    login(identifier, password)
      .then(() => navigate('/dashboard'))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="inline-block w-14 h-14 rounded-2xl bg-card-red shadow-card rotate-[-6deg] flex items-center justify-center mb-3">
            <span className="font-display font-extrabold text-2xl">U</span>
          </span>
          <h1 className="font-display font-extrabold text-3xl">Welcome back</h1>
          <p className="text-cream/60 text-sm mt-1">Log in to jump into a game.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 bg-felt-dark/50 border border-cream/10 rounded-2xl p-6">
          {error && (
            <p className="text-sm bg-card-red/20 border border-card-red/40 text-cream rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          <Field label="Username or Email" type="text" value={identifier} onChange={setIdentifier} autoFocus />
          <Field label="Password" type="password" value={password} onChange={setPassword} />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-card-yellow text-felt-dark font-semibold hover:brightness-95 transition disabled:opacity-60"
          >
            {loading ? 'Logging in…' : 'Log in'}
          </button>
        </form>

        <p className="text-center text-sm text-cream/60 mt-5">
          No account?{' '}
          <Link to="/register" className="text-card-yellow font-semibold">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}

function Field({ label, type, value, onChange, autoFocus }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-cream/80">{label}</span>
      <input
        type={type}
        value={value}
        autoFocus={autoFocus}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg bg-cream/10 px-3 py-2 placeholder:text-cream/30 focus-ring"
      />
    </label>
  )
}
