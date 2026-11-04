import assert from 'node:assert/strict'
import test from 'node:test'
import { usernameIndexKey } from './usernames.js'

test('username index keys are case-insensitive', () => {
  assert.equal(usernameIndexKey('Alice'), usernameIndexKey(' alice '))
})

test('username index keys are safe Firestore document IDs', () => {
  assert.match(usernameIndexKey('player/name'), /^[a-f0-9]{64}$/)
})
