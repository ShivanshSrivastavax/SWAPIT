import { memo } from 'react'
import { sound } from '../utils/soundEffects'

const COLOR_MAP = {
  red: 'bg-gradient-to-br from-red-500 via-card-red to-red-700 text-cream border-red-300/40',
  yellow: 'bg-gradient-to-br from-amber-300 via-card-yellow to-amber-600 text-felt-dark border-amber-200/60',
  green: 'bg-gradient-to-br from-emerald-400 via-card-green to-emerald-700 text-cream border-emerald-300/40',
  blue: 'bg-gradient-to-br from-sky-500 via-card-blue to-blue-800 text-cream border-sky-300/40',
  black: 'bg-gradient-to-br from-gray-800 via-card-black to-black text-cream border-gray-600/40',
}

function ActionGlyph({ card }) {
  if (card.type === 'action') {
    if (card.value === 'skip') return <span aria-hidden className="text-[1.2em]">⊘</span>
    if (card.value === 'reverse') return <span aria-hidden className="text-[1.2em]">⇄</span>
    if (card.value === 'drawTwo') return <span aria-hidden className="font-extrabold">+2</span>
  }
  if (card.type === 'wild') {
    if (card.value === 'wildDrawFour') return <span aria-hidden className="font-extrabold text-[1.1em]">+4</span>
    return <span aria-hidden className="text-[1.2em]">★</span>
  }
  return <span>{card.value}</span>
}

function CardBase({ card, size = 'md', faceDown = false, onClick, disabled, highlight, style }) {
  const sizes = {
    sm: 'w-12 h-16 text-sm',
    md: 'w-20 h-28 text-2xl',
    lg: 'w-28 h-40 text-4xl',
  }

  const handleClick = (e) => {
    if (disabled) return
    sound.playCard()
    if (onClick) onClick(e)
  }

  if (faceDown) {
    return (
      <div
        className={`${sizes[size]} rounded-xl bg-gradient-to-br from-felt-dark via-emerald-950 to-black border-2 border-felt-gold/50 shadow-card flex items-center justify-center select-none relative overflow-hidden group transition-all duration-300`}
        style={style}
      >
        <div className="absolute inset-1 rounded-lg border border-cream/10 bg-repeat bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:8px_8px] opacity-20" />
        <div className="w-10 h-14 rounded-full border-4 border-felt-gold/80 flex items-center justify-center bg-felt-dark shadow-inner">
          <span className="font-display font-black text-felt-gold text-xs tracking-tighter drop-shadow-md">UNO</span>
        </div>
      </div>
    )
  }

  const colorClass = COLOR_MAP[card.color] || COLOR_MAP.black
  const isWild = card.type === 'wild'

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      style={style}
      className={[
        sizes[size],
        colorClass,
        'rounded-xl shadow-card font-display font-black flex items-center justify-center relative select-none border-2 transition-all duration-200 transform-gpu',
        disabled ? 'opacity-40 cursor-not-allowed grayscale-[30%]' : 'hover:-translate-y-4 hover:shadow-card-hover hover:scale-105 cursor-pointer active:scale-95',
        highlight ? 'ring-4 ring-card-yellow animate-pulseGlow z-10' : '',
        isWild ? 'bg-gradient-to-br from-red-500 via-amber-400 via-emerald-500 to-sky-600 text-cream border-amber-200/80' : '',
      ].join(' ')}
      aria-label={cardAria(card)}
    >
      {/* Glossy overlay */}
      <div className="absolute inset-0 rounded-lg bg-gradient-to-tr from-transparent via-white/10 to-white/25 pointer-events-none" />

      {/* Center symbol */}
      <div className="w-4/5 h-3/5 rounded-full border-2 border-white/30 bg-black/15 backdrop-blur-[1px] flex items-center justify-center shadow-inner">
        <span className="drop-shadow-md transform group-hover:scale-110 transition-transform">
          <ActionGlyph card={card} />
        </span>
      </div>

      {/* Top Left Badge */}
      <span className="absolute top-1 left-2 text-[0.45em] opacity-95 font-bold tracking-tight">
        <ActionGlyph card={card} />
      </span>

      {/* Bottom Right Badge (Rotated) */}
      <span className="absolute bottom-1 right-2 text-[0.45em] opacity-95 font-bold tracking-tight rotate-180">
        <ActionGlyph card={card} />
      </span>
    </button>
  )
}

function cardAria(card) {
  if (card.type === 'wild') return card.value === 'wildDrawFour' ? 'Wild draw four' : 'Wild'
  if (card.type === 'action') return `${card.color} ${card.value}`
  return `${card.color} ${card.value}`
}

const Card = memo(CardBase)
export default Card
