export default function PlayerCard({ player, cardCount, isTurn, isHost, showCatch, onCatch }) {
  const initial = player.name?.[0]?.toUpperCase() || '?'
  return (
    <div
      className={[
        'flex items-center gap-3 px-3 py-2 rounded-xl border transition-colors',
        isTurn ? 'border-card-yellow bg-card-yellow/10' : 'border-cream/10 bg-cream/5',
      ].join(' ')}
    >
      <div
        className={[
          'w-9 h-9 rounded-full flex items-center justify-center font-display font-bold text-sm shrink-0',
          player.isBot ? 'bg-felt-light text-cream/80' : 'bg-card-blue text-cream',
        ].join(' ')}
      >
        {initial}
      </div>
      <div className="min-w-0">
        <p className="font-semibold text-sm truncate flex items-center gap-1.5">
          {player.name}
          {isHost && <span className="text-[0.65rem] uppercase tracking-wide text-card-yellow/80">host</span>}
        </p>
        <p className="text-xs text-cream/60">{cardCount} card{cardCount === 1 ? '' : 's'}</p>
      </div>
      {isTurn && <span className="ml-auto w-2 h-2 rounded-full bg-card-yellow animate-pulse" />}
      {showCatch && (
        <button
          type="button"
          onClick={onCatch}
          className="ml-auto text-[0.65rem] font-bold px-2 py-1 rounded-full bg-card-red hover:brightness-95 transition"
          title="They have 1 card and never said UNO — catch them for +2"
        >
          Catch!
        </button>
      )}
    </div>
  )
}
