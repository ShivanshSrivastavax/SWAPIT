import { createDeck, shuffle, COLORS } from './deck.js'

const HAND_SIZE = 7

/**
 * Build a fresh game state for a list of players (host + bots or others).
 * players: [{ id, name, isBot }]
 */
export function initGame(players) {
  let deck = shuffle(createDeck())
  const hands = {}
  players.forEach((p) => {
    hands[p.id] = deck.slice(0, HAND_SIZE)
    deck = deck.slice(HAND_SIZE)
  })

  // First discard card must not be an action/wild card, to keep opening simple
  let firstCardIndex = deck.findIndex((c) => c.type === 'number')
  if (firstCardIndex === -1) firstCardIndex = 0
  const firstCard = deck[firstCardIndex]
  deck.splice(firstCardIndex, 1)

  return {
    players,
    hands,
    drawPile: deck,
    discardPile: [firstCard],
    currentColor: firstCard.color,
    direction: 1, // 1 = clockwise (in player order), -1 = reverse
    currentPlayerIndex: 0,
    pendingDraw: 0, // accumulated draw-two/draw-four stack
    unoDeclared: {}, // playerId -> bool (declared before their next-next turn)
    status: 'playing', // playing | finished
    winner: null,
    log: [`Game started. First card: ${cardText(firstCard)}.`],
  }
}

function cardText(card) {
  if (card.type === 'wild') return card.value === 'wildDrawFour' ? 'Wild Draw Four' : 'Wild'
  if (card.type === 'action') {
    const map = { skip: 'Skip', reverse: 'Reverse', drawTwo: 'Draw Two' }
    return `${card.color} ${map[card.value]}`
  }
  return `${card.color} ${card.value}`
}

export function topCard(state) {
  return state.discardPile[state.discardPile.length - 1]
}

export function currentPlayer(state) {
  return state.players[state.currentPlayerIndex]
}

export function canPlayCard(state, card) {
  const top = topCard(state)
  if (card.type === 'wild') return true
  if (card.color === state.currentColor) return true
  if (card.type === 'number' && top.type === 'number' && card.value === top.value) return true
  if (card.type === 'action' && top.type === 'action' && card.value === top.value) return true
  return false
}

function nextIndex(state, from, step = 1) {
  const n = state.players.length
  return (from + state.direction * step + n * step) % n
}

function advanceTurn(state, steps = 1) {
  state.currentPlayerIndex = nextIndex(state, state.currentPlayerIndex, steps)
}

function reshuffleIfNeeded(state) {
  if (state.drawPile.length === 0) {
    const top = state.discardPile.pop()
    state.drawPile = shuffle(state.discardPile)
    state.discardPile = [top]
    state.log.push('Reshuffled discard pile into draw pile.')
  }
}

export function drawCards(state, playerId, count) {
  const drawn = []
  for (let i = 0; i < count; i += 1) {
    reshuffleIfNeeded(state)
    if (state.drawPile.length === 0) break
    const card = state.drawPile.shift()
    state.hands[playerId].push(card)
    drawn.push(card)
  }
  return drawn
}

/**
 * Play a card for the given player. Returns a new state (mutated copy) and
 * throws a descriptive Error if the move is invalid.
 * chosenColor is required when playing a wild card.
 */
export function playCard(prevState, playerId, cardId, chosenColor) {
  const state = structuredClone(prevState)
  const player = currentPlayer(state)

  if (state.status !== 'playing') throw new Error('Game already finished.')
  if (player.id !== playerId) throw new Error("It is not your turn.")

  const hand = state.hands[playerId]
  const cardIndex = hand.findIndex((c) => c.id === cardId)
  if (cardIndex === -1) throw new Error('Card not in hand.')
  const card = hand[cardIndex]

  if (!canPlayCard(state, card)) throw new Error('That card cannot be played on the current pile.')

  // If a draw stack is pending, only matching draw cards (or Draw Four) may be stacked
  if (state.pendingDraw > 0) {
    const stackable = card.value === 'drawTwo' || card.value === 'wildDrawFour'
    if (!stackable) {
      throw new Error(`You must draw ${state.pendingDraw} cards or stack a Draw card.`)
    }
  }

  if (card.type === 'wild' && !chosenColor) {
    throw new Error('Choose a color for the wild card.')
  }

  // remove from hand, add to discard
  hand.splice(cardIndex, 1)
  state.discardPile.push(card)
  state.currentColor = card.type === 'wild' ? chosenColor : card.color
  state.log.push(`${player.name} played ${cardText(card)}${card.type === 'wild' ? ` (chose ${chosenColor})` : ''}.`)

  // Reset a stale UNO declaration if the hand size moved away from 1
  // (e.g. they played a card but still have 2+ left).
  if (hand.length !== 1) delete state.unoDeclared[playerId]

  // UNO check: if player now has 1 card, they must have declared UNO (handled in UI/store).
  // If they have 0 cards, they win.
  if (hand.length === 0) {
    state.status = 'finished'
    state.winner = player.id
    state.log.push(`${player.name} wins!`)
    return state
  }

  // Apply card effects
  if (card.type === 'action') {
    if (card.value === 'skip') {
      state.log.push(`Next player is skipped.`)
      advanceTurn(state, 2)
    } else if (card.value === 'reverse') {
      state.direction *= -1
      if (state.players.length === 2) {
        // acts like skip in 2-player games
        advanceTurn(state, 2)
      } else {
        state.log.push('Turn order reversed.')
        advanceTurn(state, 1)
      }
    } else if (card.value === 'drawTwo') {
      state.pendingDraw += 2
      advanceTurn(state, 1)
    }
  } else if (card.type === 'wild') {
    if (card.value === 'wildDrawFour') {
      state.pendingDraw += 4
    }
    advanceTurn(state, 1)
  } else {
    advanceTurn(state, 1)
  }

  return state
}

/**
 * Current player draws from the pile (either by choice, or to resolve a
 * pending draw-two/draw-four stack). Ends their turn unless they choose to
 * keep drawing is disabled (classic rule: draw one, play if possible, else pass).
 */
export function drawForTurn(prevState, playerId) {
  const state = structuredClone(prevState)
  const player = currentPlayer(state)
  if (state.status !== 'playing') throw new Error('Game already finished.')
  if (player.id !== playerId) throw new Error('It is not your turn.')

  if (state.pendingDraw > 0) {
    const drawn = drawCards(state, playerId, state.pendingDraw)
    if (state.hands[playerId].length !== 1) delete state.unoDeclared[playerId]
    state.log.push(`${player.name} draws ${drawn.length} cards.`)
    state.pendingDraw = 0
    advanceTurn(state, 1)
    return state
  }

  drawCards(state, playerId, 1)
  if (state.hands[playerId].length !== 1) delete state.unoDeclared[playerId]
  state.log.push(`${player.name} draws a card.`)
  // Simplified rule: drawing always ends your turn (the drawn card stays in
  // your hand to play next time around). This keeps the flow simple and
  // avoids a "stuck turn" edge case in a frontend-only build.
  advanceTurn(state, 1)
  return state
}

export function passAfterDraw(prevState, playerId) {
  const state = structuredClone(prevState)
  const player = currentPlayer(state)
  if (player.id !== playerId) throw new Error('It is not your turn.')
  advanceTurn(state, 1)
  return state
}

export function declareUno(prevState, playerId) {
  const state = structuredClone(prevState)
  state.unoDeclared[playerId] = true
  state.log.push(`${state.players.find((p) => p.id === playerId)?.name} shouted UNO!`)
  return state
}

/** Penalize a player who has 1 card left but never declared UNO. */
export function catchMissedUno(prevState, catcherId, targetId) {
  const state = structuredClone(prevState)
  const targetHand = state.hands[targetId]
  if (targetHand.length === 1 && !state.unoDeclared[targetId]) {
    drawCards(state, targetId, 2)
    const target = state.players.find((p) => p.id === targetId)
    const catcher = state.players.find((p) => p.id === catcherId)
    state.log.push(`${catcher?.name} caught ${target?.name} not saying UNO — +2 cards!`)
  }
  return state
}

export { COLORS }
