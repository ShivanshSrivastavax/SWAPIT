import { auth } from './firebase'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4100'

async function request(path, { method = 'GET', body, authRequired = true } = {}) {
  const headers = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  if (authRequired) {
    const user = auth?.currentUser
    if (!user) throw new Error('Please log in to continue.')
    headers.Authorization = "Bearer " + await user.getIdToken()
  }

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  const isJson = res.headers.get('content-type')?.includes('application/json')
  const data = isJson ? await res.json().catch(() => ({})) : null
  if (!res.ok) {
    const error = new Error(data?.error || `Request failed (${res.status})`)
    error.status = res.status
    throw error
  }
  return data
}

export const api = {
  register: (username) => request('/auth/register', { method: 'POST', body: { username } }),
  resolveLogin: (identifier) => request('/auth/resolve-login', {
    method: 'POST',
    body: { identifier },
    authRequired: false,
  }),
  me: () => request('/auth/me'),

  getProfile: () => request('/profile'),
  updateProfile: (updates) => request('/profile', { method: 'PUT', body: updates }),

  createRoom: (botCount) => request('/rooms', { method: 'POST', body: { botCount } }),
  listRooms: () => request('/rooms'),
  getRoom: (code) => request(`/rooms/${code}`),
  joinRoom: (code) => request(`/rooms/${code}/join`, { method: 'POST' }),
  leaveRoom: (code) => request(`/rooms/${code}/leave`, { method: 'POST' }),

  getLeaderboard: () => request('/leaderboard'),
  getHistory: () => request('/games/history'),
}
