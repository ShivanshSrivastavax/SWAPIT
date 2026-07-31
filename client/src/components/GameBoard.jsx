import { useState, useCallback, useEffect } from 'react'
import Deck from './Deck'
import PlayerHand from './PlayerHand'
import PlayerCard from './PlayerCard'
import TurnIndicator from './TurnIndicator'
import UNOButton from './UNOButton'
import ColorPicker from './ColorPicker'
import { canPlayCard, currentPlayer, topCard } from '../utils/gameLogic'
import { sound } from '../utils/soundEffects'

export default function GameBoard({ game, meId, onPlayCard, onDraw, onDeclareUno, onCatchUno }) {
  const [pendingWild, setPendingWild] = useState(null)

  const me = game.players.find((p) => p.id === meId)
  const myHand = game.hands[meId] || []
  const opponents = game.players.filter((p) => p.id !== meId)
  const active = currentPlayer(game)
  const isMyTurn = active.id === meId
  const top = topCard(game)

  // Trigger turn chime when it becomes player's turn
  useEffect(() => {
    if (isMyTurn) {
      sound.turnChime()
    }
  }, [isMyTurn])

  const handlePlay = useCallback(
    (card) => {
      if (card.type === 'wild') {
        setPendingWild(card)
        return
      }
      onPlayCard(card.id)
    },
    [onPlayCard]
  )

  const handleColorChoice = useCallback(
    (color) => {
      if (pendingWild) {
        sound.unoCall()
        onPlayCard(pendingWild.id, color)
        setPendingWild(null)
      }
    },
    [pendingWild, onPlayCard]
  )

  const handleDeclareUno = useCallback(() => {
    sound.unoCall()
    onDeclareUno()
  }, [onDeclareUno])

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto w-full px-2">
      {/* Opponents row on Casino Table */}
      <div className="flex flex-wrap gap-4 justify-center items-center py-2">
        {opponents.map((p) => {
          const raw = game.hands[p.id]
          const count = typeof raw === 'number' ? raw : raw?.length ?? 0
          const showCatch = count === 1 && !game.unoDeclared[p.id]
          return (
            <PlayerCard
              key={p.id}
              player={p}
              cardCount={count}
              isTurn={active.id === p.id}
              showCatch={showCatch}
              onCatch={() => onCatchUno(p.id)}
            />
          )
        })}
      </div>

      {/* Main 3D Oval Felt Table Surface */}
      <div className="casino-table-felt py-8 px-6 sm:px-12 flex flex-col items-center gap-6 relative shadow-table my-2">
        <TurnIndicator playerName={active.name} isYou={isMyTurn} direction={game.direction} />
        
        <Deck
          drawCount={game.drawPile.length}
          topCard={top}
          onDraw={onDraw}
          canDraw={isMyTurn}
        />

        {game.pendingDraw > 0 && (
          <div className="bg-card-red/90 text-cream text-xs font-black px-4 py-1.5 rounded-full shadow-lg border border-red-300/40 animate-bounce">
            🔥 STACK ALERT: +{game.pendingDraw} CARDS PENDING!
          </div>
        )}
      </div>

      {/* My Hand Section */}
      <div className="flex flex-col items-center gap-3 mt-2">
        <div className="flex items-center justify-between w-full max-w-2xl px-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
            <p className="font-display font-extrabold text-lg tracking-wide text-cream">
              {me?.name} <span className="text-xs text-cream/60 font-body">(You)</span>
            </p>
          </div>

          <UNOButton
            onClick={handleDeclareUno}
            urgent={myHand.length === 2}
            disabled={myHand.length !== 2 && myHand.length !== 1}
          />
        </div>

        <PlayerHand
          hand={myHand}
          onPlay={handlePlay}
          canPlay={(card) => canPlayCard(game, card)}
          isMyTurn={isMyTurn}
        />
      </div>

      {pendingWild && <ColorPicker onChoose={handleColorChoice} />}
    </div>
  )
}
