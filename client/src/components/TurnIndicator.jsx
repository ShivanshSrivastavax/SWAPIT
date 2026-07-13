export default function TurnIndicator({ playerName, isYou, direction }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-felt-dark/70 border border-cream/10">
      <span className={`w-2 h-2 rounded-full ${isYou ? 'bg-card-green' : 'bg-card-yellow'} animate-pulse`} />
      <p className="text-sm font-semibold">
        {isYou ? "Your turn" : `${playerName}'s turn`}
      </p>
      <span className="text-cream/40 text-xs" title={direction === 1 ? 'Clockwise' : 'Counter-clockwise'}>
        {direction === 1 ? '↻' : '↺'}
      </span>
    </div>
  )
}
