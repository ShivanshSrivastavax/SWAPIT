import { io } from 'socket.io-client'
import { getAccessToken } from './api'

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

let socket = null

/** Lazily create (or reuse) a connected socket authenticated with the current access token. */
export function getSocket() {
  if (socket && socket.connected) return socket
  if (socket) socket.disconnect()

  socket = io(SOCKET_URL, {
    autoConnect: true,
    auth: { token: getAccessToken() },
  })
  return socket
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}
