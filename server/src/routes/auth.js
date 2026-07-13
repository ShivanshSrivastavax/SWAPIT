import { Router } from 'express'
import sendEmail from '../utils/sendEmails.js'
import registrationSuccessTemplate from '../utils/emailTemplates.js'
import bcrypt from 'bcrypt'
import { z } from 'zod'
import rateLimit from 'express-rate-limit'
import { prisma } from '../lib/prisma.js'
import { signAccessToken, signRefreshToken, verifyRefreshToken, refreshExpiryDate } from '../lib/tokens.js'
import { requireAuth } from '../middleware/auth.js'
import { findUserByLoginIdentifier } from '../lib/auth.js'

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
  email: z.string().trim().email(),
  password: z.string().min(6).max(72),
})

const loginSchema = z.object({
  identifier: z.string().trim().min(1).optional(),
  email: z.string().trim().min(1).optional(),
  username: z.string().trim().min(1).optional(),
  password: z.string().min(1),
}).superRefine((data, ctx) => {
  if (!data.identifier && !data.email && !data.username) {
    ctx.addIssue({ code: 'custom', message: 'Enter a valid username/email and password.' })
  }
})

function publicUser(user) {
  return { id: user.id, username: user.username, email: user.email, avatar: user.avatar }
}

async function issueTokens(res, user) {
  const accessToken = signAccessToken(user)
  const refreshToken = signRefreshToken(user)
  await prisma.refreshToken.create({
    data: { token: refreshToken, userId: user.id, expiresAt: refreshExpiryDate() },
  })
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  })
  return accessToken
}

router.post('/register', authLimiter, async (req, res) => {
  const parsed = registerSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.errors[0]?.message || 'Invalid input.' })
  const { username, email, password } = parsed.data

  const existing = await prisma.user.findFirst({ where: { OR: [{ email }, { username }] } })
  if (existing) return res.status(409).json({ error: 'Username or email already in use.' })

  const passwordHash = await bcrypt.hash(password, 12)
  const user = await prisma.user.create({ data: { username, email, passwordHash } })

  try {
    const loginUrl = 'http://localhost:5173/login'
    const html = registrationSuccessTemplate(username, loginUrl)
    await sendEmail(email, 'Welcome to SWAPIT', html)
  } catch (mailError) {
    console.error('Registration email failed:', mailError)
  }

  const accessToken = await issueTokens(res, user)
  res.status(201).json({ user: publicUser(user), accessToken })
})

router.post('/login', authLimiter, async (req, res) => {
  const parsed = loginSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'Enter a valid username/email and password.' })
  const { identifier, email, username, password } = parsed.data
  const loginIdentifier = identifier ?? email ?? username

  const user = await findUserByLoginIdentifier(prisma, loginIdentifier)
  if (!user) return res.status(401).json({ error: 'Invalid username/email or password.' })

  const ok = await bcrypt.compare(password, user.passwordHash)
  if (!ok) return res.status(401).json({ error: 'Invalid username/email or password.' })

  const accessToken = await issueTokens(res, user)
  res.json({ user: publicUser(user), accessToken })
})

router.post('/refresh', async (req, res) => {
  const token = req.cookies?.refreshToken
  if (!token) return res.status(401).json({ error: 'No refresh token.' })

  try {
    const payload = verifyRefreshToken(token)
    const stored = await prisma.refreshToken.findUnique({ where: { token } })
    if (!stored || stored.expiresAt < new Date()) return res.status(401).json({ error: 'Refresh token expired.' })

    const user = await prisma.user.findUnique({ where: { id: payload.sub } })
    if (!user) return res.status(401).json({ error: 'User not found.' })

    const accessToken = signAccessToken(user)
    res.json({ accessToken, user: publicUser(user) })
  } catch {
    return res.status(401).json({ error: 'Invalid refresh token.' })
  }
})

router.post('/logout', async (req, res) => {
  const token = req.cookies?.refreshToken
  if (token) {
    await prisma.refreshToken.deleteMany({ where: { token } }).catch(() => {})
  }
  res.clearCookie('refreshToken')
  res.status(204).end()
})

router.get('/me', requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id } })
  if (!user) return res.status(404).json({ error: 'User not found.' })
  res.json({ user: publicUser(user) })
})

export default router
