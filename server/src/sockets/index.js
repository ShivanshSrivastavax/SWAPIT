import { getAdminAuth, getFirestoreDb } from '../lib/firebase.js'
import { getRoomByCode, serializeRoom, setRoomStatus } from '../lib/rooms.js'
import * as gm from './gameManager.js'

async function recordResult(room, finishedGame) {
  const db = getFirestoreDb()
  const gameRef = db.collection('games').doc()
  const roomRef = db.collection('rooms').doc(room.id)
  const humanPlayers = finishedGame.players.filter((p) => !p.isBot)
  const profileRefs = humanPlayers.map((player) => db.collection('users').doc(player.id))
  const winnerPlayer = finishedGame.players.find((player) => player.id === finishedGame.winner)
  const winnerIsHuman = !String(finishedGame.winner).startsWith('bot_')

  await db.runTransaction(async (transaction) => {
    const [existingGame, roomSnapshot, ...profileSnapshots] = await Promise.all([
      transaction.get(gameRef),
      transaction.get(roomRef),
      ...profileRefs.map((ref) => transaction.get(ref)),
    ])
    if (existingGame.exists || !roomSnapshot.exists || roomSnapshot.data().status === 'finished') return

    const endedAt = new Date().toISOString()
    const players = humanPlayers.map((player) => ({
      id: player.id,
      name: player.name,
      cardsLeft: finishedGame.hands[player.id]?.length ?? 0,
    }))
    const game = {
      id: gameRef.id,
      roomCode: room.roomCode,
      winner: winnerPlayer?.name ?? 'Unknown',
      winnerId: winnerIsHuman ? finishedGame.winner : null,
      winnerName: winnerIsHuman ? null : winnerPlayer?.name ?? null,
      endedAt,
      players,
      playerIds: humanPlayers.map((player) => player.id),
    }

    transaction.create(gameRef, game)
    transaction.update(roomRef, { status: 'finished' })

    humanPlayers.forEach((player, index) => {
      const profileSnapshot = profileSnapshots[index]
      if (!profileSnapshot.exists) return

      const profile = profileSnapshot.data()
      const isWinner = player.id === finishedGame.winner
      transaction.set(profileRefs[index], {
        gamesPlayed: (profile.gamesPlayed ?? 0) + 1,
        wins: (profile.wins ?? 0) + (isWinner ? 1 : 0),
      }, { merge: true })
      transaction.create(profileRefs[index].collection('history').doc(gameRef.id), game)
    })
  })
}

export function registerSocketHandlers(io) {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token
      if (!token) return next(new Error('Missing auth token.'))
      const decoded = await getAdminAuth().verifyIdToken(token)
      const profile = await getFirestoreDb().collection('users').doc(decoded.uid).get()
      if (!profile.exists) return next(new Error('Account profile not found.'))
      socket.user = { id: decoded.uid, username: profile.data().username }
      next()
    } catch {
      next(new Error('Invalid or expired Firebase ID token.'))
    }
  })

  io.on('connection', (socket) => {
    let currentRoomCode = null

    socket.on('joinRoom', async ({ roomCode }, ack) => {
      try {
        const room = await getRoomByCode(roomCode)
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
        const room = await getRoomByCode(roomCode)
        if (!room) return ack?.({ error: 'Room not found.' })
        if (room.hostId !== socket.user.id) return ack?.({ error: 'Only the host can start the game.' })

        const players = room.players.map((player) => ({
          id: player.isBot ? player.id : player.userId,
          name: player.name,
          isBot: player.isBot,
        }))

        const game = gm.startGame(room.roomCode, players)
        await setRoomStatus(room.id, 'playing')

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
          const room = await getRoomByCode(roomCode)
          if (room) await finishGame(io, room, next)
        } else {
          gm.runBotTurns(
            roomCode,
            (updated) => broadcastState(io, roomCode, updated),
            async (finished) => {
              const room = await getRoomByCode(roomCode)
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
            const room = await getRoomByCode(roomCode)
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
