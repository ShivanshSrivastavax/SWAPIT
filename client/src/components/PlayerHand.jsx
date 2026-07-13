import Card from './Card'

export default function PlayerHand({ hand, onPlay, canPlay, isMyTurn }) {
  const n = hand.length
  return (
    <div className="w-full flex justify-center">
      <div className="flex -space-x-6 sm:-space-x-4 px-4 py-2">
        {hand.map((card, i) => {
          const mid = (n - 1) / 2
          const rotate = (i - mid) * 4
          return (
            <div
              key={card.id}
              className="animate-deal"
              style={{ transform: `rotate(${rotate}deg)`, transformOrigin: 'bottom center', zIndex: i }}
            >
              <Card
                card={card}
                size="md"
                onClick={() => onPlay(card)}
                disabled={!isMyTurn || !canPlay(card)}
              />
            </div>
          )
        })}
        {n === 0 && <p className="text-cream/50 italic py-8">No cards — you're out!</p>}
      </div>
    </div>
  )
}
