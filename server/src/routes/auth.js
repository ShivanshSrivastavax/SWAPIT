import { Router } from 'express'
import sendEmail from '../utils/sendEmails.js'
import registrationSuccessTemplate from '../utils/emailTemplates.js'
import { z } from 'zod'
import rateLimit from 'express-rate-limit'
import { getAdminAuth, getFirestoreDb } from '../lib/firebase.js'
import { asyncHandler } from '../lib/asyncHandler.js'
import { usernameIndexKey } from '../lib/usernames.js'
import { requireAuth, verifyFirebaseToken } from '../middleware/auth.js'

const router = Router()

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts. Try again later.' },
})

const registerSchema = z.object({
  username: z.string().trim().min(3).max(24),
})

const identifierSchema = z.object({
  identifier: z.string().trim().min(1).max(254),
})

function publicUser(user, id) {
  return {
    id,
    username: user.username,
    email: user.email,
    avatar: user.avatar ?? null,
  }
}

router.post('/resolve-login', authLimiter, asyncHandler(async (req, res) => {
  const parsed = identifierSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'Enter a valid username or email.' })

  const identifier = parsed.data.identifier
  if (identifier.includes('@')) return res.json({ email: identifier.toLowerCase() })

  const db = getFirestoreDb()
  const usernameRef = db.collection('usernameIndex').doc(usernameIndexKey(identifier))
  const usernameSnapshot = await usernameRef.get()
  if (!usernameSnapshot.exists) return res.status(404).json({ error: 'Username or email not found.' })

  const userSnapshot = await db.collection('users').doc(usernameSnapshot.data().uid).get()
  if (!userSnapshot.exists || !userSnapshot.data().email) {
    return res.status(404).json({ error: 'Username or email not found.' })
  }
  res.json({ email: userSnapshot.data().email })
}))

router.post('/register', authLimiter, verifyFirebaseToken, asyncHandler(async (req, res) => {
  const parsed = registerSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.errors[0]?.message || 'Invalid input.' })

  const { username } = parsed.data
  const { uid, email } = req.firebaseUser
  if (!email) return res.status(400).json({ error: 'A Firebase email account is required.' })

  const db = getFirestoreDb()
  const userRef = db.collection('users').doc(uid)
  const usernameRef = db.collection('usernameIndex').doc(usernameIndexKey(username))

  const result = await db.runTransaction(async (transaction) => {
    const [userSnapshot, usernameSnapshot] = await Promise.all([
      transaction.get(userRef),
      transaction.get(usernameRef),
    ])

    if (userSnapshot.exists) {
      return { user: publicUser(userSnapshot.data(), uid), created: false }
    }
    if (usernameSnapshot.exists && usernameSnapshot.data().uid !== uid) {
      return { conflict: true }
    }

    const profile = {
      username,
      email: email.toLowerCase(),
      avatar: null,
      wins: 0,
      gamesPlayed: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    transaction.set(userRef, profile)
    transaction.set(usernameRef, { uid })
    return { user: publicUser(profile, uid), created: true }
  })

  if (result.conflict) return res.status(409).json({ error: 'Username already in use.' })

  if (result.created) {
    try {
      await getAdminAuth().updateUser(uid, { displayName: username })
    } catch (error) {
      console.error('Firebase profile display name update failed:', error)
    }

    try {
      const loginUrl = 'http://localhost:4173/login'
      const html = registrationSuccessTemplate(username, loginUrl)
      await sendEmail(email, 'Welcome to SWAPIT', html)
    } catch (mailError) {
      console.error('Registration email failed:', mailError)
    }
  }

  res.status(result.created ? 201 : 200).json({ user: result.user })
}))

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: publicUser(req.user, req.user.id) })
})

export default router
