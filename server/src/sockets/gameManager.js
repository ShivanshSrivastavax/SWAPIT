import {
  initGame,
  playCard as playCardLogic,
  drawForTurn as drawForTurnLogic,
  passAfterDraw as passAfterDrawLogic,
  declareUno as declareUnoLogic,
  catchMissedUno as catchMissedUnoLogic,
  currentPlayer,
} from '../game/gameLogic.js'
import { chooseBotCard, chooseBotColor } from '../game/bots.js'

// Live game state lives in memory on the server process, keyed by room code.
// This is the "source of truth" — clients only ever see a sanitized view
// (their own hand + everyone else's card counts).
const games = new Map() // roomCode -> game state

export function hasGame(roomCode) {
  return games.has(roomCode)
}

export function getGame(roomCode) {
  return games.get(roomCode)
}

export function startGame(roomCode, players) {
  const game = initGame(players)
  games.set(roomCode, game)
  return game
}

export function endGame(roomCode) {
  games.delete(roomCode)
}

/** Strip other players' hands down to counts only — never leak private state. */
export function sanitizeForPlayer(game, playerId) {
  const hands = {}
  Object.entries(game.hands).forEach(([pid, hand]) => {
    hands[pid] = pid === playerId ? hand : hand.length
  })
  return { ...game, hands }
}

export function playCard(roomCode, playerId, cardId, chosenColor) {
  const game = games.get(roomCode)
  if (!game) throw new Error('No active game for this room.')
  const next = playCardLogic(game, playerId, cardId, chosenColor)
  games.set(roomCode, next)
  return next
}

export function drawForTurn(roomCode, playerId) {
  const game = games.get(roomCode)
  if (!game) throw new Error('No active game for this room.')
  const next = drawForTurnLogic(game, playerId)
  games.set(roomCode, next)
  return next
}

export function passAfterDraw(roomCode, playerId) {
  const game = games.get(roomCode)
  if (!game) throw new Error('No active game for this room.')
  const next = passAfterDrawLogic(game, playerId)
  games.set(roomCode, next)
  return next
}

export function declareUno(roomCode, playerId) {
  const game = games.get(roomCode)
  if (!game) throw new Error('No active game for this room.')
  const next = declareUnoLogic(game, playerId)
  games.set(roomCode, next)
  return next
}

export function catchMissedUno(roomCode, catcherId, targetId) {
  const game = games.get(roomCode)
  if (!game) throw new Error('No active game for this room.')
  const next = catchMissedUnoLogic(game, catcherId, targetId)
  games.set(roomCode, next)
  return next
}

/**
 * Runs bot turns one at a time (with a small delay for UX) until it's a
 * human's turn again or the game ends. Calls onUpdate(game) after every
 * bot action so the caller can broadcast state.
 */
export function runBotTurns(roomCode, onUpdate, onFinished) {
  const step = () => {
    const game = games.get(roomCode)
    if (!game || game.status !== 'playing') return
    const player = currentPlayer(game)
    if (!player.isBot) return

    setTimeout(() => {
      const state = games.get(roomCode)
      if (!state || state.status !== 'playing') return
      const bot = currentPlayer(state)
      if (!bot.isBot) return

      const hand = state.hands[bot.id]
      const choice = chooseBotCard(state, hand)
      let next

      if (choice) {
        const color = choice.type === 'wild' ? chooseBotColor(hand) : undefined
        try {
          next = playCardLogic(state, bot.id, choice.id, color)
          if (next.hands[bot.id]?.length === 1) next = declareUnoLogic(next, bot.id)
        } catch {
          next = state
        }
      } else {
        const drawn = drawForTurnLogic(state, bot.id)
        const stillTurn = currentPlayer(drawn)?.id === bot.id
        next = stillTurn ? passAfterDrawLogic(drawn, bot.id) : drawn
      }

      games.set(roomCode, next)
      onUpdate(next)

      if (next.status === 'finished') {
        onFinished(next)
        return
      }
      step()
    }, 650)
  }
  step()
}
