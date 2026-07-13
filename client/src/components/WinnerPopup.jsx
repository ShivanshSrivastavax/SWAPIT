export default function WinnerPopup({ winnerName, isYou, standings, onPlayAgain, onExit }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="w-full max-w-sm rounded-2xl bg-felt-dark border-2 border-card-yellow shadow-card p-6 text-center animate-played">
        <p className="text-5xl mb-2">{isYou ? '🏆' : '🎉'}</p>
        <h2 className="font-display font-extrabold text-2xl mb-1">
          {isYou ? 'You win!' : `${winnerName} wins!`}
        </h2>
        <p className="text-cream/60 text-sm mb-5">Great game — here's how everyone finished.</p>

        <ul className="text-left space-y-1.5 mb-6">
          {standings.map((s, i) => (
            <li key={s.id} className="flex items-center justify-between text-sm px-3 py-1.5 rounded-lg bg-cream/5">
              <span className="font-medium">{i + 1}. {s.name}</span>
              <span className="text-cream/60">{s.cardsLeft} card{s.cardsLeft === 1 ? '' : 's'} left</span>
            </li>
          ))}
        </ul>

        <div className="flex gap-2">
          <button
            onClick={onPlayAgain}
            className="flex-1 py-2.5 rounded-xl bg-card-yellow text-felt-dark font-semibold hover:brightness-95 transition"
          >
            Play again
          </button>
          <button
            onClick={onExit}
            className="flex-1 py-2.5 rounded-xl bg-cream/10 font-semibold hover:bg-cream/20 transition"
          >
            Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}
