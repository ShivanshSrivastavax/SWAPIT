const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

let accessToken = null
export function setAccessToken(token) {
  accessToken = token
}
export function getAccessToken() {
  return accessToken
}

// Access tokens are short-lived (see JWT_EXPIRES_IN on the server, default
// 15m). Rather than making every page track expiry, a 401 triggers exactly
// one silent refresh attempt (using the httpOnly refresh cookie) and the
// original request is retried once with the new token. If the refresh
// itself fails (e.g. the refresh token is also expired), the caller sees
// the original 401 error as normal.
let refreshPromise = null
async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_URL}/auth/refresh`, { method: 'POST', credentials: 'include' })
      .then(async (res) => {
        if (!res.ok) throw new Error('Session expired.')
        const data = await res.json()
        setAccessToken(data.accessToken)
        return data.accessToken
      })
      .finally(() => {
        refreshPromise = null
      })
  }
  return refreshPromise
}

async function rawRequest(path, { method, headers, body }) {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    credentials: 'include', // send/receive the httpOnly refresh-token cookie
    body,
  })
  const isJson = res.headers.get('content-type')?.includes('application/json')
  const data = isJson ? await res.json().catch(() => ({})) : null
  return { res, data }
}

async function request(path, { method = 'GET', body, auth = true, _retried = false } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (auth && accessToken) headers.Authorization = `Bearer ${accessToken}`
  const bodyStr = body ? JSON.stringify(body) : undefined

  const { res, data } = await rawRequest(path, { method, headers, body: bodyStr })

  if (res.status === 401 && auth && !_retried) {
    try {
      await refreshAccessToken()
      return request(path, { method, body, auth, _retried: true })
    } catch {
      // fall through to the original 401 error below
    }
  }

  if (!res.ok) {
    throw new Error(data?.error || `Request failed (${res.status})`)
  }
  return data
}

export const api = {
  register: (username, email, password) => request('/auth/register', { method: 'POST', body: { username, email, password }, auth: false }),
  login: (identifier, password) => request('/auth/login', { method: 'POST', body: { identifier, password }, auth: false }),
  refresh: () => request('/auth/refresh', { method: 'POST', auth: false }),
  logout: () => request('/auth/logout', { method: 'POST' }),
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
