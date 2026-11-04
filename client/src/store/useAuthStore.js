import { createUserWithEmailAndPassword, deleteUser, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { create } from 'zustand'
import { api } from '../lib/api'
import { auth, requireFirebaseAuth } from '../lib/firebase'
import { disconnectSocket, watchSocketAuth } from '../lib/socket'

let stopWatchingAuth = null

export const useAuthStore = create((set) => ({
  user: null,
  status: 'idle',

  bootstrap: () => {
    if (stopWatchingAuth) return
    if (!auth) {
      set({ user: null, status: 'ready' })
      return
    }

    set({ status: 'loading' })
    watchSocketAuth()
    stopWatchingAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        set({ user: null, status: 'ready' })
        return
      }

      try {
        const { user } = await api.me()
        set({ user, status: 'ready' })
      } catch {
        set({ user: null, status: 'ready' })
      }
    })
  },

  register: async (username, email, password) => {
    const firebaseAuth = requireFirebaseAuth()
    let firebaseUser
    let createdForThisAttempt = true
    try {
      firebaseUser = (await createUserWithEmailAndPassword(firebaseAuth, email, password)).user
    } catch (error) {
      if (error.code !== 'auth/email-already-in-use') throw error

      firebaseUser = (await signInWithEmailAndPassword(firebaseAuth, email, password)).user
      createdForThisAttempt = false
      try {
        const { user } = await api.me()
        await signOut(firebaseAuth)
        throw new Error(`Account ${user.email} is already registered. Please log in.`)
      } catch (profileError) {
        if (profileError.status !== 403) throw profileError
      }
    }

    try {
      const { user } = await api.register(username)
      set({ user, status: 'ready' })
      return user
    } catch (error) {
      if (error.status === 409 && createdForThisAttempt) await deleteUser(firebaseUser)
      await signOut(firebaseAuth)
      throw error
    }
  },

  login: async (identifier, password) => {
    const firebaseAuth = requireFirebaseAuth()
    const email = identifier.includes('@')
      ? identifier.trim().toLowerCase()
      : (await api.resolveLogin(identifier)).email
    await signInWithEmailAndPassword(firebaseAuth, email, password)
    const { user } = await api.me()
    set({ user, status: 'ready' })
    return user
  },

  logout: async () => {
    if (auth) await signOut(auth)
    disconnectSocket()
    set({ user: null, status: 'ready' })
  },

  updateProfile: async (updates) => {
    const { user } = await api.updateProfile(updates)
    set({ user })
    return user
  },
}))
