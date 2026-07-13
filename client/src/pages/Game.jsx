import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import { useGameStore } from '../store/useGameStore'
import GameBoard from '../components/GameBoard'
import ChatBox from '../components/ChatBox'
import WinnerPopup from '../components/WinnerPopup'
import LoadingSpinner from '../components/LoadingSpinner'

export default function Game() {
  const user = useAuthStore((s) => s.user)
  const room = useGameStore((s) => s.room)
  const game = useGameStore((s) => s.game)
  const error = useGameStore((s) => s.error)
  const clearError = useGameStore((s) => s.clearError)
  const playCard = useGameStore((s) => s.playCard)
  const drawForTurn = useGameStore((s) => s.drawForTurn)
  const declareUno = useGameStore((s) => s.declareUno)
  const catchMissedUno = useGameStore((s) => s.catchMissedUno)
  const startGame = useGameStore((s) => s.startGame)
  const leaveRoom = useGameStore((s) => s.leaveRoom)
  const messages = useGameStore((s) => s.messages)
  const sendMessage = useGameStore((s) => s.sendMessage)
  const navigate = useNavigate()

  useEffect(() => {
    if (!room || !game) navigate('/dashboard')
  }, [room, game, navigate])

  useEffect(() => {
    if (!error) return
    const t = setTimeout(() => clearError(), 2500)
    return () => clearTimeout(t)
  }, [error, clearError])

  if (!room || !game) return <LoadingSpinner label="Loading game…" />

  function handlePlayAgain() {
    startGame()
  }

  async function handleExit() {
    await leaveRoom()
    navigate('/dashboard')
  }

  const winnerName = game.players.find((p) => p.id === game.winner)?.name
  const standings = [...game.players]
    .map((p) => ({
      id: p.id,
      name: p.name,
      cardsLeft: p.id === user.id ? (game.hands[p.id]?.length ?? 0) : (game.hands[p.id] ?? 0),
    }))
    .sort((a, b) => a.cardsLeft - b.cardsLeft)

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {error && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-40 bg-card-red text-cream px-4 py-2 rounded-lg shadow-card text-sm font-medium">
          {error}
        </div>
      )}

      <div className="grid lg:grid-cols-[1fr_260px] gap-6">
        <GameBoard
          game={game}
          meId={user.id}
          onPlayCard={(cardId, color) => playCard(user.id, cardId, color)}
          onDraw={() => drawForTurn(user.id)}
          onDeclareUno={() => declareUno(user.id)}
          onCatchUno={(targetId) => catchMissedUno(user.id, targetId)}
        />

        <div className="hidden lg:block h-96">
          <ChatBox messages={messages} onSend={(text) => sendMessage(user.username, text)} currentUsername={user.username} />
        </div>
      </div>

      {game.status === 'finished' && (
        <WinnerPopup
          winnerName={winnerName}
          isYou={game.winner === user.id}
          standings={standings}
          onPlayAgain={handlePlayAgain}
          onExit={handleExit}
        />
      )}
    </div>
  )
}
