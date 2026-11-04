import { randomInt, randomUUID } from 'node:crypto'
import { Router } from 'express'
import { z } from 'zod'
import { getFirestoreDb } from '../lib/firebase.js'
import { asyncHandler } from '../lib/asyncHandler.js'
import { buildBotName } from '../lib/botNames.js'
import { getRoomByCode, serializeRoom } from '../lib/rooms.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()
router.use(requireAuth)

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
function makeRoomCode() {
  let code = ''
  for (let i = 0; i < 5; i += 1) code += CODE_CHARS[randomInt(CODE_CHARS.length)]
  return code
}

const createSchema = z.object({
  botCount: z.number().int().min(0).max(3).default(0),
})

async function createUniqueRoom(botCount, user) {
  const db = getFirestoreDb()

  for (let attempt = 0; attempt < 10; attempt += 1) {
    const roomCode = makeRoomCode()
    const roomRef = db.collection('rooms').doc()
    const codeRef = db.collection('roomCodes').doc(roomCode)
    const players = [{
      userId: user.id,
      name: user.username,
      isBot: false,
    }]
    const existingNames = [user.username]

    for (let i = 0; i < botCount; i += 1) {
      const botName = buildBotName(i, existingNames)
      existingNames.push(botName)
      players.push({
        id: `bot_${randomUUID()}`,
        userId: user.id,
        name: botName,
        botName,
        isBot: true,
      })
    }

    const created = await db.runTransaction(async (transaction) => {
      const codeSnapshot = await transaction.get(codeRef)
      if (codeSnapshot.exists) return false

      const room = {
        roomCode,
        hostId: user.id,
        status: 'waiting',
        maxPlayers: 4,
        createdAt: new Date().toISOString(),
        players,
      }
      transaction.create(codeRef, { roomId: roomRef.id })
      transaction.create(roomRef, room)
      return true
    })

    if (created) return { id: roomRef.id, roomCode, hostId: user.id, status: 'waiting', maxPlayers: 4, players }
  }

  throw new Error('Could not generate a unique room code.')
}

router.post('/', asyncHandler(async (req, res) => {
  const parsed = createSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input.' })

  const room = await createUniqueRoom(parsed.data.botCount, req.user)
  res.status(201).json({ room: serializeRoom(room) })
}))

router.get('/', asyncHandler(async (req, res) => {
  const snapshot = await getFirestoreDb()
    .collection('rooms')
    .where('status', '==', 'waiting')
    .orderBy('createdAt', 'desc')
    .limit(50)
    .get()
  const rooms = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  res.json({ rooms: rooms.map(serializeRoom) })
}))

router.get('/:code', asyncHandler(async (req, res) => {
  const room = await getRoomByCode(req.params.code)
  if (!room) return res.status(404).json({ error: 'Room not found.' })
  res.json({ room: serializeRoom(room) })
}))

router.post('/:code/join', asyncHandler(async (req, res) => {
  const db = getFirestoreDb()
  const roomCode = req.params.code.toUpperCase()
  const codeRef = db.collection('roomCodes').doc(roomCode)
  const outcome = await db.runTransaction(async (transaction) => {
    const codeSnapshot = await transaction.get(codeRef)
    if (!codeSnapshot.exists) return { missing: true }

    const roomRef = db.collection('rooms').doc(codeSnapshot.data().roomId)
    const roomSnapshot = await transaction.get(roomRef)
    if (!roomSnapshot.exists) return { missing: true }

    const room = { id: roomSnapshot.id, ...roomSnapshot.data() }
    if (room.status !== 'waiting') return { conflict: 'This room has already started.' }

    const alreadyIn = room.players.some((player) => !player.isBot && player.userId === req.user.id)
    if (!alreadyIn && room.players.length >= room.maxPlayers) return { conflict: 'Room is full.' }
    if (!alreadyIn) {
      room.players.push({ userId: req.user.id, name: req.user.username, isBot: false })
      transaction.update(roomRef, { players: room.players })
    }

    return { room }
  })

  if (outcome.missing) return res.status(404).json({ error: 'Room not found.' })
  if (outcome.conflict) return res.status(409).json({ error: outcome.conflict })
  res.json({ room: serializeRoom(outcome.room) })
}))

router.post('/:code/leave', asyncHandler(async (req, res) => {
  const db = getFirestoreDb()
  const roomCode = req.params.code.toUpperCase()
  const codeRef = db.collection('roomCodes').doc(roomCode)
  const outcome = await db.runTransaction(async (transaction) => {
    const codeSnapshot = await transaction.get(codeRef)
    if (!codeSnapshot.exists) return { missing: true }

    const roomRef = db.collection('rooms').doc(codeSnapshot.data().roomId)
    const roomSnapshot = await transaction.get(roomRef)
    if (!roomSnapshot.exists) return { missing: true }

    const room = { id: roomSnapshot.id, ...roomSnapshot.data() }
    const remaining = room.players.filter((player) => player.isBot || player.userId !== req.user.id)
    const remainingHumans = remaining.filter((player) => !player.isBot)
    if (remainingHumans.length === 0) {
      transaction.delete(roomRef)
      transaction.delete(codeRef)
      return { deleted: true }
    }

    const updates = { players: remaining }
    if (room.hostId === req.user.id) updates.hostId = remainingHumans[0].userId
    transaction.update(roomRef, updates)
    return { deleted: false }
  })

  if (outcome.missing) return res.status(404).json({ error: 'Room not found.' })
  res.status(204).end()
}))

export default router
