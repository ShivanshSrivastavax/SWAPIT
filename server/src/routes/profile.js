import { Router } from 'express'
import bcrypt from 'bcrypt'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

const updateSchema = z.object({
  username: z.string().trim().min(3).max(24).optional(),
  password: z.string().min(6).max(72).optional(),
})

function publicUser(user) {
  return { id: user.id, username: user.username, email: user.email, avatar: user.avatar }
}

router.get('/', requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id } })
  if (!user) return res.status(404).json({ error: 'User not found.' })
  res.json({ user: publicUser(user) })
})

router.put('/', requireAuth, async (req, res) => {
  const parsed = updateSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.errors[0]?.message || 'Invalid input.' })
  const { username, password } = parsed.data

  const data = {}
  if (username) {
    const taken = await prisma.user.findFirst({ where: { username, NOT: { id: req.user.id } } })
    if (taken) return res.status(409).json({ error: 'Username already taken.' })
    data.username = username
  }
  if (password) data.passwordHash = await bcrypt.hash(password, 12)

  const user = await prisma.user.update({ where: { id: req.user.id }, data })
  res.json({ user: publicUser(user) })
})

export default router
