import { create } from 'zustand'
import { api } from '../lib/api'
import { getSocket } from '../lib/socket'

let listenersAttached = false

/**
 * Real-time game store. Room membership and gameplay now go through the
 * Express API (rooms) and Socket.IO (live presence + server-authoritative
 * game state). The server never sends other players' hands -- only counts --
 * so `game.hands[someoneElse]` is a number, not an array, unless it's you.
 */
export const useGameStore = create((set, get) => ({
  room: null, // { code, hostId, status, players: [{id,name,isBot}] }
  game: null, // sanitized game state from the server (own hand only)
  messages: [], // { id, author, text, ts }
  error: null,

  /** Attach Socket.IO listeners once per session. Safe to call repeatedly. */
  _ensureListeners: () => {
    if (listenersAttached) return
    listenersAttached = true
    const socket = getSocket()

    socket.on('playerJoined', ({ room }) => {
      set((s) => (s.room && s.room.code === room.code ? { room } : s))
    })

    socket.on('playerLeft', () => {
      const { room } = get()
      if (!room) return
      api.getRoom(room.code).then(({ room: fresh }) => set({ room: fresh })).catch(() => {})
    })

    socket.on('gameStarted', ({ game }) => {
      set((s) => ({ game, room: s.room ? { ...s.room, status: 'playing' } : s.room }))
    })

    socket.on('stateUpdate', ({ game }) => set({ game }))

    socket.on('gameEnded', () => {
      // Final state (with winner set) already arrived via stateUpdate/playCard ack.
    })

    socket.on('messageReceived', (msg) => {
      set((s) => ({ messages: [...s.messages, msg] }))
    })
  },

  // ---------- Room management ----------
  createRoom: async (botCount = 3) => {
    get()._ensureListeners()
    const { room } = await api.createRoom(botCount)
    const socket = getSocket()
    await new Promise((resolve, reject) => {
      socket.emit('joinRoom', { roomCode: room.code }, (res) => (res?.error ? reject(new Error(res.error)) : resolve(res)))
    })
    set({ room, game: null, messages: [], error: null })
    return room
  },

  joinRoom: async (code) => {
    get()._ensureListeners()
    const { room } = await api.joinRoom(code.toUpperCase())
    const socket = getSocket()
    await new Promise((resolve, reject) => {
      socket.emit('joinRoom', { roomCode: room.code }, (res) => (res?.error ? reject(new Error(res.error)) : resolve(res)))
    })
    set({ room, game: null, messages: [], error: null })
    return room
  },

  leaveRoom: async () => {
    const { room } = get()
    if (room) {
      const socket = getSocket()
      socket.emit('leaveRoom', { roomCode: room.code })
      await api.leaveRoom(room.code).catch(() => {})
    }
    set({ room: null, game: null, messages: [] })
  },

  startGame: () => {
    return new Promise((resolve, reject) => {
      const { room } = get()
      if (!room) return reject(new Error('No room'))
      
      const socket = getSocket()
      
      // Wait for the gameStarted event to actually set the game state
      const gameStartedHandler = ({ game }) => {
        socket.off('gameStarted', gameStartedHandler)
        resolve(game)
      }
      
      socket.once('gameStarted', gameStartedHandler)
      
      socket.emit('startGame', { roomCode: room.code }, (res) => {
        if (res?.error) {
          socket.off('gameStarted', gameStartedHandler)
          set({ error: res.error })
          reject(new Error(res.error))
        }
      })
    })
  },

  // ---------- Chat ----------
  sendMessage: (author, text) => {
    const { room } = get()
    if (!room || !text.trim()) return
    const socket = getSocket()
    socket.emit('sendMessage', { roomCode: room.code, text })
  },

  // ---------- Gameplay (server-authoritative; these just emit and wait for ack) ----------
  playCard: (playerId, cardId, chosenColor) => {
    const { room } = get()
    if (!room) return
    const socket = getSocket()
    socket.emit('playCard', { roomCode: room.code, cardId, chosenColor }, (res) => {
      if (res?.error) set({ error: res.error })
    })
  },

  drawForTurn: (playerId) => {
    const { room } = get()
    if (!room) return
    const socket = getSocket()
    socket.emit('drawCard', { roomCode: room.code }, (res) => {
      if (res?.error) set({ error: res.error })
    })
  },

  clearError: () => set({ error: null }),

  declareUno: (playerId) => {
    const { room } = get()
    if (!room) return
    const socket = getSocket()
    socket.emit('declareUno', { roomCode: room.code })
  },

  catchMissedUno: (catcherId, targetId) => {
    const { room } = get()
    if (!room) return
    const socket = getSocket()
    socket.emit('catchMissedUno', { roomCode: room.code, targetId })
  },
}))

// ---------- Stats (fetched from the server; async) ----------
export async function getLeaderboard() {
  const { leaderboard } = await api.getLeaderboard()
  return leaderboard
}

export async function getHistory() {
  const { history } = await api.getHistory()
  return history
}
