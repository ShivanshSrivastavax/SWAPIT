import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameStore } from '../store/useGameStore'

export default function CreateRoom() {
  const createRoom = useGameStore((s) => s.createRoom)
  const navigate = useNavigate()
  const [botCount, setBotCount] = useState(3)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleCreate() {
    setError('')
    setLoading(true)
    try {
      await createRoom(botCount)
      navigate('/rooms/waiting')
    } catch (err) {
      setError(err.message || 'Could not create the room.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto px-5 py-14">
      <h1 className="font-display font-extrabold text-3xl mb-2">Create a room</h1>
      <p className="text-cream/60 mb-8 text-sm">
        Fill empty seats with bots, or leave them open for other players to join with the room code.
      </p>

      <div className="bg-felt-dark/50 border border-cream/10 rounded-2xl p-6 space-y-5">
        {error && (
          <p className="text-sm bg-card-red/20 border border-card-red/40 rounded-lg px-3 py-2">{error}</p>
        )}
        <div>
          <p className="text-sm font-medium text-cream/80 mb-2">Number of bot opponents</p>
          <div className="flex gap-2">
            {[0, 1, 2, 3].map((n) => (
              <button
                key={n}
                onClick={() => setBotCount(n)}
                className={`flex-1 py-2 rounded-lg font-semibold transition-colors ${
                  botCount === n ? 'bg-card-yellow text-felt-dark' : 'bg-cream/10 hover:bg-cream/20'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
          <p className="text-xs text-cream/50 mt-2">Total players: {botCount + 1} / 4</p>
        </div>

        <button
          onClick={handleCreate}
          disabled={loading}
          className="w-full py-2.5 rounded-xl bg-card-red font-semibold hover:brightness-95 transition disabled:opacity-60"
        >
          {loading ? 'Creating…' : 'Create room'}
        </button>
      </div>
    </div>
  )
}
