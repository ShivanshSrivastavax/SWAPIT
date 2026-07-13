import { create } from 'zustand'
import { api, setAccessToken } from '../lib/api'
import { disconnectSocket } from '../lib/socket'

export const useAuthStore = create((set, get) => ({
  user: null,
  status: 'idle', // idle | loading | ready

  /** Try to restore a session on app load using the httpOnly refresh cookie. */
  bootstrap: async () => {
    set({ status: 'loading' })
    try {
      const { accessToken, user } = await api.refresh()
      setAccessToken(accessToken)
      set({ user, status: 'ready' })
    } catch {
      set({ user: null, status: 'ready' })
    }
  },

  register: async (username, email, password) => {
    const { accessToken, user } = await api.register(username, email, password)
    setAccessToken(accessToken)
    set({ user })
    return user
  },

  login: async (identifier, password) => {
    const { accessToken, user } = await api.login(identifier, password)
    setAccessToken(accessToken)
    set({ user })
    return user
  },

  logout: async () => {
    try {
      await api.logout()
    } catch {
      // best-effort -- clear local state regardless
    }
    setAccessToken(null)
    disconnectSocket()
    set({ user: null })
  },

  updateProfile: async (updates) => {
    const { user } = await api.updateProfile(updates)
    set({ user })
    return user
  },
}))
