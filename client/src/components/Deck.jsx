import { memo } from 'react'
import Card from './Card'
import { sound } from '../utils/soundEffects'

function DeckBase({ drawCount, topCard, onDraw, canDraw }) {
  const handleDrawClick = () => {
    if (!canDraw) return
    sound.drawCard()
    if (onDraw) onDraw()
  }

  return (
    <div className="flex items-center justify-center gap-8 sm:gap-14 my-2 select-none">
      {/* Draw Pile (Stacked Cards) */}
      <div className="flex flex-col items-center gap-2 relative">
        <div className="relative group">
          {/* Background Card Stack Effects */}
          <div className="absolute top-2 left-2 w-28 h-40 rounded-xl bg-felt-dark border border-cream/10 shadow-md transform rotate-6 pointer-events-none" />
          <div className="absolute top-1 left-1 w-28 h-40 rounded-xl bg-felt-dark border border-cream/10 shadow-md transform -rotate-3 pointer-events-none" />
          
          <button
            type="button"
            onClick={handleDrawClick}
            disabled={!canDraw}
            className={`relative focus:outline-none transition-transform duration-200 ${
              canDraw ? 'hover:scale-105 active:scale-95 cursor-pointer ring-2 ring-card-yellow/50 rounded-xl' : 'opacity-60 cursor-not-allowed'
            }`}
            aria-label="Draw a card"
          >
            <Card card={{}} faceDown size="lg" />
          </button>

          {/* Draw badge */}
          <div className="absolute -top-3 -right-3 bg-gradient-to-r from-card-yellow to-amber-500 text-felt-dark font-display font-black text-xs px-2.5 py-1 rounded-full shadow-lg border border-amber-200/50 animate-bounce">
            DRAW
          </div>
        </div>
        <span className="text-xs font-bold tracking-wider text-cream/70 uppercase">
          {drawCount} cards remaining
        </span>
      </div>

      {/* Discard Pile */}
      <div className="flex flex-col items-center gap-2">
        <div className="relative animate-played transform hover:scale-105 transition-transform">
          {topCard ? (
            <div className="relative">
              <div className="absolute inset-0 bg-card-yellow/20 rounded-xl blur-lg animate-pulse" />
              <Card card={topCard} size="lg" disabled />
            </div>
          ) : null}
        </div>
        <span className="text-xs font-bold tracking-wider text-cream/70 uppercase">Discard Pile</span>
      </div>
    </div>
  )
}

const Deck = memo(DeckBase)
export default Deck
