import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { buildBotName } from '../lib/botNames.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()
router.use(requireAuth)

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
function makeRoomCode() {
  let code = ''
  for (let i = 0; i < 5; i += 1) code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]
  return code
}

async function uniqueRoomCode() {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const code = makeRoomCode()
    const exists = await prisma.room.findUnique({ where: { roomCode: code } })
    if (!exists) return code
  }
  throw new Error('Could not generate a unique room code.')
}

function serializeRoom(room) {
  return {
    id: room.id,
    code: room.roomCode,
    hostId: room.hostId,
    status: room.status,
    maxPlayers: room.maxPlayers,
    players: room.players.map((p) => ({
      id: p.isBot ? `bot_${p.id}` : p.userId,
      name: p.isBot ? p.botName : p.user?.username,
      isBot: p.isBot,
    })),
  }
}

const createSchema = z.object({
  botCount: z.number().int().min(0).max(3).default(0),
})

// POST /rooms — create a room, optionally pre-filled with bots
router.post('/', async (req, res) => {
  const parsed = createSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input.' })
  const { botCount } = parsed.data

  const roomCode = await uniqueRoomCode()
  const room = await prisma.room.create({
    data: {
      roomCode,
      hostId: req.user.id,
      players: { create: { userId: req.user.id, isBot: false } },
    },
    include: { players: { include: { user: true } } },
  })

  const existingNames = room.players?.map((player) => player.user?.username).filter(Boolean) ?? []

  // Bots are represented as room_players rows tied to the host account but
  // flagged isBot so the client can render them without needing real users.
  for (let i = 0; i < botCount; i += 1) {
    await prisma.roomPlayer.create({
      data: {
        roomId: room.id,
        userId: req.user.id, // placeholder FK; isBot flag is what the UI uses
        isBot: true,
        botName: buildBotName(i, existingNames),
      },
    })
  }

  const full = await prisma.room.findUnique({ where: { id: room.id }, include: { players: { include: { user: true } } } })
  res.status(201).json({ room: serializeRoom(full) })
})

// GET /rooms — list open rooms
router.get('/', async (req, res) => {
  const rooms = await prisma.room.findMany({
    where: { status: 'waiting' },
    include: { players: { include: { user: true } } },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })
  res.json({ rooms: rooms.map(serializeRoom) })
})

// GET /rooms/:code — room details + players (lookup by room code)
router.get('/:code', async (req, res) => {
  const room = await prisma.room.findUnique({
    where: { roomCode: req.params.code.toUpperCase() },
    include: { players: { include: { user: true } } },
  })
  if (!room) return res.status(404).json({ error: 'Room not found.' })
  res.json({ room: serializeRoom(room) })
})

// POST /rooms/:code/join
router.post('/:code/join', async (req, res) => {
  const room = await prisma.room.findUnique({
    where: { roomCode: req.params.code.toUpperCase() },
    include: { players: true },
  })
  if (!room) return res.status(404).json({ error: 'Room not found.' })
  if (room.status !== 'waiting') return res.status(409).json({ error: 'This room has already started.' })
  if (room.players.length >= room.maxPlayers) return res.status(409).json({ error: 'Room is full.' })

  const alreadyIn = room.players.some((p) => !p.isBot && p.userId === req.user.id)
  if (!alreadyIn) {
    await prisma.roomPlayer.create({ data: { roomId: room.id, userId: req.user.id, isBot: false } })
  }

  const full = await prisma.room.findUnique({ where: { id: room.id }, include: { players: { include: { user: true } } } })
  res.json({ room: serializeRoom(full) })
})

// POST /rooms/:code/leave
router.post('/:code/leave', async (req, res) => {
  const room = await prisma.room.findUnique({ where: { roomCode: req.params.code.toUpperCase() }, include: { players: true } })
  if (!room) return res.status(404).json({ error: 'Room not found.' })

  await prisma.roomPlayer.deleteMany({ where: { roomId: room.id, userId: req.user.id, isBot: false } })

  const remaining = await prisma.roomPlayer.findMany({ where: { roomId: room.id, isBot: false } })
  if (remaining.length === 0) {
    await prisma.room.delete({ where: { id: room.id } }).catch(() => {})
    return res.status(204).end()
  }

  // Reassign host if the host left
  if (room.hostId === req.user.id) {
    await prisma.room.update({ where: { id: room.id }, data: { hostId: remaining[0].userId } })
  }
  res.status(204).end()
})

export default router
