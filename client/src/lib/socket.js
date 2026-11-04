import { io } from 'socket.io-client'
import { onIdTokenChanged } from 'firebase/auth'
import { auth } from './firebase'

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:4100'

let socket = null
let stopWatchingTokens = null

export function watchSocketAuth() {
  if (!auth || stopWatchingTokens) return

  stopWatchingTokens = onIdTokenChanged(auth, (user) => {
    if (!socket) return
    if (!user) {
      disconnectSocket()
      return
    }

    socket.auth = (callback) => {
      user.getIdToken().then((token) => callback({ token })).catch(() => callback({}))
    }
    if (socket.connected) socket.disconnect()
    socket.connect()
  })
}

/** Lazily create (or reuse) a socket authenticated with a Firebase ID token. */
export function getSocket() {
  if (socket) return socket

  socket = io(SOCKET_URL, {
    autoConnect: true,
    auth: (callback) => {
      const user = auth?.currentUser
      if (!user) return callback({})
      user.getIdToken().then((token) => callback({ token })).catch(() => callback({}))
    },
  })
  return socket
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}
