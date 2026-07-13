import { useEffect, useState } from 'react'
import { getLeaderboard } from '../store/useGameStore'
import ScoreBoard from '../components/ScoreBoard'
import LoadingSpinner from '../components/LoadingSpinner'

export default function Leaderboard() {
  const [rows, setRows] = useState(null)

  useEffect(() => {
    let cancelled = false
    getLeaderboard()
      .then((data) => {
        if (!cancelled) setRows(data)
      })
      .catch(() => {
        if (!cancelled) setRows([])
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="max-w-3xl mx-auto px-5 py-10">
      <h1 className="font-display font-extrabold text-3xl mb-1">Leaderboard</h1>
      <p className="text-cream/60 mb-8 text-sm">Ranked by wins, then win rate.</p>
      {rows === null ? <LoadingSpinner label="Loading leaderboard…" /> : <ScoreBoard rows={rows} />}
    </div>
  )
}
