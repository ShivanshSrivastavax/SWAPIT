import { Link } from 'react-router-dom'
import Card from '../components/Card'

const SAMPLE_CARDS = [
  { id: '1', color: 'red', type: 'number', value: 7 },
  { id: '2', color: 'yellow', type: 'action', value: 'skip' },
  { id: '3', color: 'black', type: 'wild', value: 'wildDrawFour' },
  { id: '4', color: 'blue', type: 'action', value: 'reverse' },
  { id: '5', color: 'green', type: 'number', value: 3 },
]

export default function Landing() {
  return (
    <div className="max-w-5xl mx-auto px-5 py-16 text-center">
      <div className="flex justify-center -space-x-6 mb-10">
        {SAMPLE_CARDS.map((c, i) => (
          <div key={c.id} style={{ transform: `rotate(${(i - 2) * 8}deg)`, zIndex: i }}>
            <Card card={c} size="lg" disabled />
          </div>
        ))}
      </div>

      <h1 className="font-display font-extrabold text-4xl sm:text-5xl mb-4">
        SwapIt, right in your browser
      </h1>
      <p className="text-cream/70 max-w-xl mx-auto mb-8">
        Create a table, play the full rule set — Skip, Reverse, Draw Two, Wild, Wild Draw Four —
        against bots, track your wins, and climb the leaderboard.
      </p>

      <div className="flex items-center justify-center gap-3">
        <Link to="/register" className="px-6 py-3 rounded-xl bg-card-yellow text-felt-dark font-semibold hover:brightness-95 transition">
          Get started
        </Link>
        <Link to="/login" className="px-6 py-3 rounded-xl bg-cream/10 font-semibold hover:bg-cream/20 transition">
          Log in
        </Link>
      </div>
    </div>
  )
}
