const COLOR_MAP = {
  red: 'bg-card-red',
  yellow: 'bg-card-yellow',
  green: 'bg-card-green',
  blue: 'bg-card-blue',
  black: 'bg-card-black',
}

const TEXT_ON = {
  red: 'text-cream',
  yellow: 'text-felt-dark',
  green: 'text-cream',
  blue: 'text-cream',
  black: 'text-cream',
}

function ActionGlyph({ card }) {
  if (card.type === 'action') {
    if (card.value === 'skip') return <span aria-hidden>⊘</span>
    if (card.value === 'reverse') return <span aria-hidden>⇄</span>
    if (card.value === 'drawTwo') return <span aria-hidden>+2</span>
  }
  if (card.type === 'wild') {
    if (card.value === 'wildDrawFour') return <span aria-hidden>+4</span>
    return <span aria-hidden>★</span>
  }
  return <span>{card.value}</span>
}

export default function Card({ card, size = 'md', faceDown = false, onClick, disabled, highlight, style }) {
  const sizes = {
    sm: 'w-10 h-16 text-sm',
    md: 'w-16 h-24 text-xl',
    lg: 'w-24 h-36 text-3xl',
  }

  if (faceDown) {
    return (
      <div
        className={`${sizes[size]} rounded-lg bg-felt-dark border-2 border-cream/20 shadow-card flex items-center justify-center select-none`}
        style={style}
      >
        <div className="w-3/5 h-3/5 rounded-full border-4 border-card-yellow/70" />
      </div>
    )
  }

  const colorClass = COLOR_MAP[card.color] || COLOR_MAP.black
  const textClass = TEXT_ON[card.color] || TEXT_ON.black
  const isWild = card.type === 'wild'

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={style}
      className={[
        sizes[size],
        colorClass,
        textClass,
        'rounded-lg shadow-card font-display font-extrabold flex items-center justify-center relative border-2 border-cream/25 transition-transform',
        disabled ? 'opacity-40 cursor-not-allowed' : 'hover:-translate-y-2 cursor-pointer',
        highlight ? 'ring-4 ring-card-yellow animate-pulseGlow' : '',
        isWild ? 'bg-gradient-to-br from-card-red via-card-green to-card-blue' : '',
      ].join(' ')}
      aria-label={cardAria(card)}
    >
      <span className="drop-shadow-sm">
        <ActionGlyph card={card} />
      </span>
      <span className="absolute top-1 left-1.5 text-[0.55em] opacity-80"><ActionGlyph card={card} /></span>
    </button>
  )
}

function cardAria(card) {
  if (card.type === 'wild') return card.value === 'wildDrawFour' ? 'Wild draw four' : 'Wild'
  if (card.type === 'action') return `${card.color} ${card.value}`
  return `${card.color} ${card.value}`
}
