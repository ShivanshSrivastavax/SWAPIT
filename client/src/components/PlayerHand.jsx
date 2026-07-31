import { memo } from 'react'
import Card from './Card'

function PlayerHandBase({ hand, onPlay, canPlay, isMyTurn }) {
  const n = hand.length

  return (
    <div className="w-full flex justify-center overflow-x-auto py-6 px-2">
      <div className="flex -space-x-8 sm:-space-x-6 px-6 py-2 transition-all duration-300">
        {hand.map((card, i) => {
          const mid = (n - 1) / 2
          const rotate = n > 1 ? (i - mid) * (n > 10 ? 3 : 5) : 0
          const translateY = Math.abs(i - mid) * 2
          const playable = isMyTurn && canPlay(card)

          return (
            <div
              key={card.id}
              className="animate-deal transition-transform duration-300 hover:z-50 hover:scale-110"
              style={{
                transform: `rotate(${rotate}deg) translateY(${translateY}px)`,
                transformOrigin: 'bottom center',
                zIndex: i,
              }}
            >
              <Card
                card={card}
                size="md"
                onClick={() => onPlay(card)}
                disabled={!isMyTurn || !playable}
                highlight={playable}
              />
            </div>
          )
        })}
        {n === 0 && (
          <div className="glass-panel rounded-2xl px-8 py-6 text-center shadow-lg">
            <p className="text-card-yellow font-display font-extrabold text-xl animate-pulse">🎉 NO CARDS LEFT — YOU WON!</p>
          </div>
        )}
      </div>
    </div>
  )
}

const PlayerHand = memo(PlayerHandBase)
export default PlayerHand
