import { useState } from 'react'
import Deck from './Deck'
import PlayerHand from './PlayerHand'
import PlayerCard from './PlayerCard'
import TurnIndicator from './TurnIndicator'
import UNOButton from './UNOButton'
import ColorPicker from './ColorPicker'
import { canPlayCard, currentPlayer, topCard } from '../utils/gameLogic'

export default function GameBoard({ game, meId, onPlayCard, onDraw, onDeclareUno, onCatchUno }) {
  const [pendingWild, setPendingWild] = useState(null) // card awaiting color choice

  const me = game.players.find((p) => p.id === meId)
  const myHand = game.hands[meId] || []
  const opponents = game.players.filter((p) => p.id !== meId)
  const active = currentPlayer(game)
  const isMyTurn = active.id === meId
  const top = topCard(game)

  function handlePlay(card) {
    if (card.type === 'wild') {
      setPendingWild(card)
      return
    }
    onPlayCard(card.id)
  }

  function handleColorChoice(color) {
    if (pendingWild) {
      onPlayCard(pendingWild.id, color)
      setPendingWild(null)
    }
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Opponents row */}
      <div className="flex flex-wrap gap-2 justify-center">
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

      {/* Center: turn indicator + deck */}
      <div className="flex flex-col items-center gap-4">
        <TurnIndicator playerName={active.name} isYou={isMyTurn} direction={game.direction} />
        <Deck
          drawCount={game.drawPile.length}
          topCard={top}
          onDraw={onDraw}
          canDraw={isMyTurn}
        />
        {game.pendingDraw > 0 && (
          <p className="text-sm font-semibold text-card-red">
            Draw stack: +{game.pendingDraw} pending
          </p>
        )}
      </div>

      {/* My hand */}
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center gap-3">
          <p className="font-display font-bold">{me?.name} (you)</p>
          <UNOButton
            onClick={() => onDeclareUno()}
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
