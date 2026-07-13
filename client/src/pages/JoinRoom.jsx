import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameStore } from '../store/useGameStore'

export default function JoinRoom() {
  const joinRoom = useGameStore((s) => s.joinRoom)
  const navigate = useNavigate()
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleJoin(e) {
    e.preventDefault()
    if (code.trim().length < 4) {
      setError('Enter a valid room code.')
      return
    }
    setError('')
    setLoading(true)
    try {
      await joinRoom(code.trim())
      navigate('/rooms/waiting')
    } catch (err) {
      setError(err.message || 'Could not join that room.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto px-5 py-14">
      <h1 className="font-display font-extrabold text-3xl mb-2">Join a room</h1>
      <p className="text-cream/60 mb-8 text-sm">
        Enter the room code you were given to join an existing table in real time.
      </p>

      <form onSubmit={handleJoin} className="bg-felt-dark/50 border border-cream/10 rounded-2xl p-6 space-y-4">
        {error && (
          <p className="text-sm bg-card-red/20 border border-card-red/40 rounded-lg px-3 py-2">{error}</p>
        )}
        <label className="block">
          <span className="text-sm font-medium text-cream/80">Room code</span>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            maxLength={6}
            placeholder="ABCDE"
            className="mt-1 w-full rounded-lg bg-cream/10 px-3 py-2 font-mono text-xl tracking-[0.3em] text-center placeholder:text-cream/20 focus-ring"
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-xl bg-card-blue font-semibold hover:brightness-95 transition disabled:opacity-60"
        >
          {loading ? 'Joining…' : 'Join room'}
        </button>
      </form>
    </div>
  )
}
