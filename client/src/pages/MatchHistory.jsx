import { useEffect, useState } from 'react'
import { getHistory } from '../store/useGameStore'
import LoadingSpinner from '../components/LoadingSpinner'

export default function MatchHistory() {
  const [history, setHistory] = useState(null)

  useEffect(() => {
    let cancelled = false
    getHistory()
      .then((data) => {
        if (!cancelled) setHistory(data)
      })
      .catch(() => {
        if (!cancelled) setHistory([])
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (history === null) return <LoadingSpinner label="Loading match history…" />

  return (
    <div className="max-w-3xl mx-auto px-5 py-10">
      <h1 className="font-display font-extrabold text-3xl mb-1">Match history</h1>
      <p className="text-cream/60 mb-8 text-sm">Your last {history.length} game{history.length === 1 ? '' : 's'}.</p>

      {history.length === 0 ? (
        <div className="text-center py-16 text-cream/50">
          <p className="font-display text-lg mb-1">No matches yet</p>
          <p className="text-sm">Play a game to see it show up here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((g) => (
            <div key={g.id} className="rounded-xl border border-cream/10 bg-felt-dark/50 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-sm text-card-yellow tracking-widest">{g.roomCode}</span>
                <span className="text-xs text-cream/50">{new Date(g.endedAt).toLocaleString()}</span>
              </div>
              <p className="text-sm mb-2">
                Winner: <span className="font-semibold">{g.winner}</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {g.players.map((p) => (
                  <span key={p.id} className="text-xs px-2 py-1 rounded-full bg-cream/10">
                    {p.name} · {p.cardsLeft} left
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
