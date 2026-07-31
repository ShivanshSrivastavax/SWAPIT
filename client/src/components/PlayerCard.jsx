import { memo } from 'react'

function PlayerCardBase({ player, cardCount, isTurn, isHost, showCatch, onCatch }) {
  const initial = player.name?.[0]?.toUpperCase() || '?'

  return (
    <div
      className={[
        'flex items-center gap-3 px-4 py-2.5 rounded-2xl border backdrop-blur-md transition-all duration-300 shadow-md',
        isTurn
          ? 'border-card-yellow bg-card-yellow/15 shadow-glow scale-105 ring-2 ring-card-yellow/50'
          : 'border-cream/10 bg-felt-dark/60 hover:bg-felt-dark/80',
      ].join(' ')}
    >
      {/* Avatar icon with turn ring */}
      <div className="relative">
        <div
          className={[
            'w-10 h-10 rounded-full flex items-center justify-center font-display font-extrabold text-base shrink-0 shadow-inner border border-white/20',
            player.isBot
              ? 'bg-gradient-to-br from-emerald-600 to-teal-800 text-cream'
              : 'bg-gradient-to-br from-card-blue to-indigo-800 text-cream',
          ].join(' ')}
        >
          {player.isBot ? '🤖' : initial}
        </div>
        {isTurn && (
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-card-yellow border-2 border-felt-dark animate-ping" />
        )}
      </div>

      <div className="min-w-0">
        <p className="font-display font-bold text-sm truncate flex items-center gap-1.5">
          {player.name}
          {isHost && (
            <span className="text-[0.6rem] uppercase font-black tracking-wider px-1.5 py-0.5 rounded bg-card-yellow/20 text-card-yellow border border-card-yellow/30">
              HOST
            </span>
          )}
        </p>
        <p className="text-xs font-semibold text-cream/70">
          🃏 {cardCount} {cardCount === 1 ? 'card' : 'cards'}
        </p>
      </div>

      {showCatch && (
        <button
          type="button"
          onClick={onCatch}
          className="ml-auto text-xs font-black px-3 py-1 rounded-full bg-card-red text-cream hover:bg-red-600 transition shadow-lg animate-bounce border border-red-300/40"
          title="They have 1 card and haven't declared UNO — catch them!"
        >
          CATCH UNO!
        </button>
      )}
    </div>
  )
}

const PlayerCard = memo(PlayerCardBase)
export default PlayerCard
