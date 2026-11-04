import { getFirestoreDb } from './firebase.js'

export async function getRoomByCode(roomCode) {
  const db = getFirestoreDb()
  const code = String(roomCode).toUpperCase()
  const codeSnapshot = await db.collection('roomCodes').doc(code).get()
  if (!codeSnapshot.exists) return null

  const roomSnapshot = await db.collection('rooms').doc(codeSnapshot.data().roomId).get()
  return roomSnapshot.exists ? { id: roomSnapshot.id, ...roomSnapshot.data() } : null
}

export function serializeRoom(room) {
  return {
    id: room.id,
    code: room.roomCode,
    hostId: room.hostId,
    status: room.status,
    maxPlayers: room.maxPlayers,
    players: room.players.map((player) => ({
      id: player.isBot ? player.id : player.userId,
      name: player.name,
      isBot: player.isBot,
    })),
  }
}

export async function setRoomStatus(roomId, status) {
  await getFirestoreDb().collection('rooms').doc(roomId).update({ status })
}
