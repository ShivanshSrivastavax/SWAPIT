export default function UNOButton({ onClick, urgent, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={[
        'font-display font-extrabold text-lg px-6 py-3 rounded-full border-4 border-cream shadow-card transition-transform',
        'bg-card-red text-cream tracking-wider',
        urgent ? 'animate-pulseGlow scale-105' : '',
        disabled ? 'opacity-40 cursor-not-allowed' : 'hover:scale-105 active:scale-95',
      ].join(' ')}
    >
      UNO!
    </button>
  )
}
