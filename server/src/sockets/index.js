import { verifyAccessToken } from '../lib/tokens.js'
import { prisma } from '../lib/prisma.js'
import * as gm from './gameManager.js'

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

async function recordResult(room, finishedGame) {
  const winnerIsHuman = !String(finishedGame.winner).startsWith('bot_')
  const winnerPlayer = finishedGame.players.find((p) => p.id === finishedGame.winner)
  const game = await prisma.game.create({
    data: {
      roomId: room.id,
      winnerId: winnerIsHuman ? finishedGame.winner : null,
      winnerName: winnerIsHuman ? null : winnerPlayer?.name ?? null,
      endedAt: new Date(),
    },
  })

  const humanPlayers = finishedGame.players.filter((p) => !p.isBot)
  await Promise.all(
    humanPlayers.map((p, i) =>
      prisma.gamePlayer.create({
        data: {
          gameId: game.id,
          userId: p.id,
          position: i,
          cardsLeft: finishedGame.hands[p.id]?.length ?? 0,
          isWinner: p.id === finishedGame.winner,
        },
      })
    )
  )

  await prisma.room.update({ where: { id: room.id }, data: { status: 'finished' } })
}

export function registerSocketHandlers(io) {
  // Authenticate every socket connection using the JWT access token.
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token
      if (!token) return next(new Error('Missing auth token.'))
      const payload = verifyAccessToken(token)
      socket.user = { id: payload.sub, username: payload.username }
      next()
    } catch {
      next(new Error('Invalid or expired token.'))
    }
  })

  io.on('connection', (socket) => {
    let currentRoomCode = null

    socket.on('joinRoom', async ({ roomCode }, ack) => {
      try {
        const room = await prisma.room.findUnique({
          where: { roomCode: roomCode.toUpperCase() },
          include: { players: { include: { user: true } } },
        })
        if (!room) return ack?.({ error: 'Room not found.' })

        currentRoomCode = room.roomCode
        socket.join(room.roomCode)
        socket.to(room.roomCode).emit('playerJoined', { room: serializeRoom(room) })
        ack?.({ room: serializeRoom(room) })
      } catch (err) {
        console.error('[socket error]', err)
        ack?.({ error: err.message })
      }
    })

    socket.on('leaveRoom', async ({ roomCode }) => {
      socket.leave(roomCode)
      socket.to(roomCode).emit('playerLeft', { userId: socket.user.id })
      if (currentRoomCode === roomCode) currentRoomCode = null
    })

    socket.on('startGame', async ({ roomCode }, ack) => {
      try {
        const room = await prisma.room.findUnique({
          where: { roomCode: roomCode.toUpperCase() },
          include: { players: { include: { user: true } } },
        })
        if (!room) return ack?.({ error: 'Room not found.' })
        if (room.hostId !== socket.user.id) return ack?.({ error: 'Only the host can start the game.' })

        const players = room.players.map((p) => ({
          id: p.isBot ? `bot_${p.id}` : p.userId,
          name: p.isBot ? p.botName : p.user?.username,
          isBot: p.isBot,
        }))

        const game = gm.startGame(room.roomCode, players)
        await prisma.room.update({ where: { id: room.id }, data: { status: 'playing' } })

        // Each socket in the room gets a view with only their own hand visible.
        const sockets = await io.in(room.roomCode).fetchSockets()
        sockets.forEach((s) => {
          s.emit('gameStarted', { game: gm.sanitizeForPlayer(game, s.user.id) })
        })
        ack?.({ ok: true })

        gm.runBotTurns(
          room.roomCode,
          (updated) => broadcastState(io, room.roomCode, updated),
          (finished) => finishGame(io, room, finished)
        )
      } catch (err) {
        console.error('[socket error]', err)
        ack?.({ error: err.message })
      }
    })

    socket.on('playCard', async ({ roomCode, cardId, chosenColor }, ack) => {
      try {
        const next = gm.playCard(roomCode, socket.user.id, cardId, chosenColor)
        broadcastState(io, roomCode, next)
        ack?.({ ok: true })

        if (next.status === 'finished') {
          const room = await prisma.room.findUnique({ where: { roomCode } })
          if (room) await finishGame(io, room, next)
        } else {
          gm.runBotTurns(
            roomCode,
            (updated) => broadcastState(io, roomCode, updated),
            async (finished) => {
              const room = await prisma.room.findUnique({ where: { roomCode } })
              if (room) await finishGame(io, room, finished)
            }
          )
        }
      } catch (err) {
        console.error('[socket error]', err)
        ack?.({ error: err.message })
      }
    })

    socket.on('drawCard', async ({ roomCode }, ack) => {
      try {
        const next = gm.drawForTurn(roomCode, socket.user.id)
        broadcastState(io, roomCode, next)
        ack?.({ ok: true })
        gm.runBotTurns(
          roomCode,
          (updated) => broadcastState(io, roomCode, updated),
          async (finished) => {
            const room = await prisma.room.findUnique({ where: { roomCode } })
            if (room) await finishGame(io, room, finished)
          }
        )
      } catch (err) {
        console.error('[socket error]', err)
        ack?.({ error: err.message })
      }
    })

    socket.on('declareUno', ({ roomCode }, ack) => {
      try {
        const next = gm.declareUno(roomCode, socket.user.id)
        broadcastState(io, roomCode, next)
        ack?.({ ok: true })
      } catch (err) {
        console.error('[socket error]', err)
        ack?.({ error: err.message })
      }
    })

    socket.on('catchMissedUno', ({ roomCode, targetId }, ack) => {
      try {
        const next = gm.catchMissedUno(roomCode, socket.user.id, targetId)
        broadcastState(io, roomCode, next)
        ack?.({ ok: true })
      } catch (err) {
        console.error('[socket error]', err)
        ack?.({ error: err.message })
      }
    })

    socket.on('sendMessage', async ({ roomCode, text }) => {
      if (!text?.trim()) return
      const message = {
        id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        author: socket.user.username,
        text: text.trim(),
        ts: Date.now(),
      }
      io.in(roomCode).emit('messageReceived', message)
    })

    socket.on('disconnect', () => {
      if (currentRoomCode) {
        socket.to(currentRoomCode).emit('playerLeft', { userId: socket.user.id })
      }
    })
  })
}

function broadcastState(io, roomCode, game) {
  io.in(roomCode)
    .fetchSockets()
    .then((sockets) => {
      sockets.forEach((s) => {
        s.emit('stateUpdate', { game: gm.sanitizeForPlayer(game, s.user.id) })
      })
    })
}

async function finishGame(io, room, finishedGame) {
  try {
    await recordResult(room, finishedGame)
  } catch (err) {
    // A failure here means the game ended but the win/loss was NOT saved to
    // the database. This must never fail silently -- log it loudly.
    console.error(`[finishGame] Failed to record result for room ${room.roomCode}:`, err)
  }
  io.in(room.roomCode).emit('gameEnded', { winner: finishedGame.winner })
  gm.endGame(room.roomCode)
}
