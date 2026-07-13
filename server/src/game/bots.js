import { canPlayCard, COLORS } from './gameLogic.js'

/** Pick the best card for a bot to play from its hand, or null to draw. */
export function chooseBotCard(state, hand) {
  if (state.pendingDraw > 0) {
    const stackable = hand.filter((c) => c.type === 'action' && c.value === 'drawTwo')
    if (stackable.length === 0) return null
    const playable = stackable.filter((c) => canPlayCard(state, c))
    if (playable.length === 0) return null
    return playable[0]
  }

  const playable = hand.filter((c) => canPlayCard(state, c))
  if (playable.length === 0) return null

  // Prefer to save wilds for later; play action cards early to disrupt;
  // otherwise play highest-value number card first to shed points.
  const priority = (c) => {
    if (c.type === 'wild') return c.value === 'wildDrawFour' ? 1 : 2
    if (c.type === 'action') return 3
    return 4
  }
  playable.sort((a, b) => priority(b) - priority(a) || (b.value ?? 0) - (a.value ?? 0))
  return playable[0]
}

/** Choose a color for a bot's wild card: whichever color it holds most of. */
export function chooseBotColor(hand) {
  const counts = { red: 0, yellow: 0, green: 0, blue: 0 }
  hand.forEach((c) => {
    if (COLORS.includes(c.color)) counts[c.color] += 1
  })
  let best = COLORS[0]
  COLORS.forEach((c) => {
    if (counts[c] > counts[best]) best = c
  })
  if (counts[best] === 0) {
    best = COLORS[Math.floor(Math.random() * COLORS.length)]
  }
  return best
}
