const DEFAULT_BOT_NAMES = ['Bot 1', 'Bot 2', 'Bot 3', 'Bot 4', 'Bot 5', 'Bot 6']

export function buildBotName(index, reservedNames = []) {
  const base = DEFAULT_BOT_NAMES[index % DEFAULT_BOT_NAMES.length]
  const taken = new Set(reservedNames.map((name) => name.toLowerCase()))

  let candidate = base
  let suffix = 1
  while (taken.has(candidate.toLowerCase())) {
    candidate = `${base} ${suffix}`
    suffix += 1
  }

  return candidate
}
