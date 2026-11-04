import { Router } from 'express'
import { z } from 'zod'
import { getAdminAuth, getFirestoreDb } from '../lib/firebase.js'
import { asyncHandler } from '../lib/asyncHandler.js'
import { usernameIndexKey } from '../lib/usernames.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

const updateSchema = z.object({
  username: z.string().trim().min(3).max(24).optional(),
  password: z.string().min(6).max(72).optional(),
}).refine((data) => data.username !== undefined || data.password !== undefined, {
  message: 'Provide a username or password to update.',
})

function publicUser(user, id) {
  return { id, username: user.username, email: user.email, avatar: user.avatar ?? null }
}

router.get('/', requireAuth, (req, res) => {
  res.json({ user: publicUser(req.user, req.user.id) })
})

router.put('/', requireAuth, asyncHandler(async (req, res) => {
  const parsed = updateSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.errors[0]?.message || 'Invalid input.' })

  const { username, password } = parsed.data
  const db = getFirestoreDb()
  const userRef = db.collection('users').doc(req.user.id)
  let updatedProfile

  if (username && username !== req.user.username) {
    const newUsernameRef = db.collection('usernameIndex').doc(usernameIndexKey(username))
    const oldUsernameRef = db.collection('usernameIndex').doc(usernameIndexKey(req.user.username))

    const result = await db.runTransaction(async (transaction) => {
      const [userSnapshot, newUsernameSnapshot] = await Promise.all([
        transaction.get(userRef),
        transaction.get(newUsernameRef),
      ])
      if (!userSnapshot.exists) return { missing: true }
      if (newUsernameSnapshot.exists && newUsernameSnapshot.data().uid !== req.user.id) {
        return { conflict: true }
      }

      const oldProfile = userSnapshot.data()
      const nextProfile = { ...oldProfile, username, updatedAt: new Date().toISOString() }
      transaction.set(userRef, nextProfile)
      transaction.set(newUsernameRef, { uid: req.user.id })
      if (oldUsernameRef.path !== newUsernameRef.path) transaction.delete(oldUsernameRef)
      return { profile: nextProfile }
    })

    if (result.conflict) return res.status(409).json({ error: 'Username already taken.' })
    if (result.missing) return res.status(404).json({ error: 'User not found.' })
    updatedProfile = result.profile
  } else {
    const userSnapshot = await userRef.get()
    if (!userSnapshot.exists) return res.status(404).json({ error: 'User not found.' })
    updatedProfile = userSnapshot.data()
  }

  const authUpdates = {}
  if (username) authUpdates.displayName = updatedProfile.username
  if (password) authUpdates.password = password
  if (Object.keys(authUpdates).length > 0) await getAdminAuth().updateUser(req.user.id, authUpdates)

  res.json({ user: publicUser(updatedProfile, req.user.id) })
}))

export default router
