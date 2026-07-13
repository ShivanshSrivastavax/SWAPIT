import test from 'node:test'
import assert from 'node:assert/strict'
import { chooseBotCard } from './bots.js'

test('bot skips non-stackable cards when a draw penalty is pending', () => {
  const state = {
    currentColor: 'red',
    pendingDraw: 2,
    discardPile: [{ id: 'top', type: 'number', color: 'blue', value: 7 }],
    players: [{ id: 'bot', name: 'Bot', isBot: true }],
    direction: 1,
    currentPlayerIndex: 0,
  }

  const hand = [{ id: 'a', type: 'number', color: 'red', value: 5 }]
  assert.equal(chooseBotCard(state, hand), null)
})
