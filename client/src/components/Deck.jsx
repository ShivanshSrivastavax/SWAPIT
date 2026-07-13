import Card from './Card'

export default function Deck({ drawCount, topCard, onDraw, canDraw }) {
  return (
    <div className="flex items-center gap-6 sm:gap-10">
      <div className="flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={onDraw}
          disabled={!canDraw}
          className={`focus-ring rounded-lg ${canDraw ? '' : 'opacity-60 cursor-not-allowed'}`}
          aria-label="Draw a card"
        >
          <Card card={{}} faceDown size="lg" />
        </button>
        <span className="text-xs font-semibold text-cream/60">{drawCount} left</span>
      </div>

      <div className="flex flex-col items-center gap-2">
        <div className="animate-played">
          {topCard ? <Card card={topCard} size="lg" disabled /> : null}
        </div>
        <span className="text-xs font-semibold text-cream/60">Current card</span>
      </div>
    </div>
  )
}
