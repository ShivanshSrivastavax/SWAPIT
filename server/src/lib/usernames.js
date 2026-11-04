import { createHash } from 'node:crypto'

export function usernameIndexKey(username) {
  return createHash('sha256').update(username.trim().toLowerCase()).digest('hex')
}
