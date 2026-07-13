import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import { useGameStore } from '../store/useGameStore'
import RoomInfo from '../components/RoomInfo'
import PlayerCard from '../components/PlayerCard'
import ChatBox from '../components/ChatBox'
import LoadingSpinner from '../components/LoadingSpinner'

export default function WaitingRoom() {
  const user = useAuthStore((s) => s.user)
  const room = useGameStore((s) => s.room)
  const startGame = useGameStore((s) => s.startGame)
  const leaveRoom = useGameStore((s) => s.leaveRoom)
  const messages = useGameStore((s) => s.messages)
  const sendMessage = useGameStore((s) => s.sendMessage)
  const navigate = useNavigate()

  useEffect(() => {
    if (!room) navigate('/dashboard')
  }, [room, navigate])

  if (!room) return <LoadingSpinner label="Loading room…" />

  const isHost = room.hostId === user.id

  async function handleStart() {
    try {
      await startGame()
      navigate('/game')
    } catch (err) {
      console.error('Failed to start game:', err)
    }
  }

  async function handleLeave() {
    await leaveRoom()
    navigate('/dashboard')
  }

  return (
    <div className="max-w-3xl mx-auto px-5 py-10">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <h1 className="font-display font-extrabold text-3xl">Waiting room</h1>
        <RoomInfo code={room.code} status={room.status} playerCount={room.players.length} />
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        <div>
          <h2 className="font-semibold text-sm text-cream/60 uppercase tracking-wide mb-3">Players</h2>
          <div className="space-y-2 mb-6">
            {room.players.map((p) => (
              <PlayerCard key={p.id} player={p} cardCount={0} isTurn={false} isHost={p.id === room.hostId} />
            ))}
          </div>

          <div className="flex gap-2">
            {isHost && (
              <button
                onClick={handleStart}
                className="flex-1 py-2.5 rounded-xl bg-card-yellow text-felt-dark font-semibold hover:brightness-95 transition"
              >
                Start game
              </button>
            )}
            <button
              onClick={handleLeave}
              className="flex-1 py-2.5 rounded-xl bg-cream/10 font-semibold hover:bg-cream/20 transition"
            >
              Leave room
            </button>
          </div>
          {!isHost && (
            <p className="text-xs text-cream/50 mt-2">Waiting for the host to start the game…</p>
          )}
        </div>

        <div className="h-72">
          <ChatBox messages={messages} onSend={(text) => sendMessage(user.username, text)} currentUsername={user.username} />
        </div>
      </div>
    </div>
  )
}
