export default function RoomInfo({ code, status, playerCount, maxPlayers = 4 }) {
  return (
    <div className="inline-flex items-center gap-4 rounded-xl border-2 border-dashed border-cream/25 px-5 py-3 bg-felt-dark/50">
      <div>
        <p className="text-[0.65rem] uppercase tracking-widest text-cream/50">Room code</p>
        <p className="font-mono font-bold text-2xl tracking-[0.2em] text-card-yellow">{code}</p>
      </div>
      <div className="h-8 w-px bg-cream/15" />
      <div>
        <p className="text-[0.65rem] uppercase tracking-widest text-cream/50">Status</p>
        <p className="font-semibold capitalize">{status}</p>
      </div>
      <div className="h-8 w-px bg-cream/15" />
      <div>
        <p className="text-[0.65rem] uppercase tracking-widest text-cream/50">Players</p>
        <p className="font-semibold">{playerCount}/{maxPlayers}</p>
      </div>
    </div>
  )
}
