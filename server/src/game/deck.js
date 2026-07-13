// UNO deck: 108 cards total
// 4 colors x (one 0, two each of 1-9, two Skip, two Reverse, two Draw Two) = 4 x 25 = 100
// 4 Wild + 4 Wild Draw Four = 8
// Total = 108

export const COLORS = ['red', 'yellow', 'green', 'blue']

let cardIdCounter = 0
function nextId() {
  cardIdCounter += 1
  return `card_${cardIdCounter}_${Math.random().toString(36).slice(2, 7)}`
}

export function createDeck() {
  const deck = []

  COLORS.forEach((color) => {
    // one 0
    deck.push({ id: nextId(), color, type: 'number', value: 0 })
    // two each of 1-9
    for (let n = 1; n <= 9; n += 1) {
      deck.push({ id: nextId(), color, type: 'number', value: n })
      deck.push({ id: nextId(), color, type: 'number', value: n })
    }
    // two each of Skip, Reverse, Draw Two
    ;['skip', 'reverse', 'drawTwo'].forEach((action) => {
      deck.push({ id: nextId(), color, type: 'action', value: action })
      deck.push({ id: nextId(), color, type: 'action', value: action })
    })
  })

  // wilds
  for (let i = 0; i < 4; i += 1) {
    deck.push({ id: nextId(), color: 'black', type: 'wild', value: 'wild' })
  }
  for (let i = 0; i < 4; i += 1) {
    deck.push({ id: nextId(), color: 'black', type: 'wild', value: 'wildDrawFour' })
  }

  return deck
}

export function shuffle(deck) {
  const arr = [...deck]
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export function cardLabel(card) {
  if (!card) return ''
  if (card.type === 'wild') {
    return card.value === 'wildDrawFour' ? 'Wild +4' : 'Wild'
  }
  if (card.type === 'action') {
    const map = { skip: 'Skip', reverse: 'Reverse', drawTwo: '+2' }
    return map[card.value]
  }
  return String(card.value)
}
