import test from 'node:test'
import assert from 'node:assert/strict'
import { findUserByLoginIdentifier } from './auth.js'

test('finds a user by username case-insensitively', async () => {
  const user = { id: '1', username: 'Alice', email: 'alice@example.com' }
  const prisma = {
    user: {
      findFirst: async ({ where }) => {
        const matches = where.OR.some((condition) => condition.username?.equals === 'alice' && condition.username?.mode === 'insensitive')
        return matches ? user : null
      },
    },
  }

  const result = await findUserByLoginIdentifier(prisma, 'ALICE')
  assert.equal(result?.id, '1')
})

test('finds a user by email case-insensitively', async () => {
  const user = { id: '2', username: 'bob', email: 'Bob@example.com' }
  const prisma = {
    user: {
      findFirst: async ({ where }) => {
        const matches = where.OR.some((condition) => condition.email?.equals === 'bob@example.com' && condition.email?.mode === 'insensitive')
        return matches ? user : null
      },
    },
  }

  const result = await findUserByLoginIdentifier(prisma, 'BOB@EXAMPLE.COM')
  assert.equal(result?.id, '2')
})
