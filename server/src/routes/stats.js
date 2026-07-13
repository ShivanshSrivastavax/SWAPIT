import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()
router.use(requireAuth)

// GET /leaderboard — aggregate wins/losses/win-rate per user
router.get('/leaderboard', async (req, res) => {
  const users = await prisma.user.findMany({
    include: { gamePlayers: true },
  })

  const rows = users
    .map((u) => {
      const gamesPlayed = u.gamePlayers.length
      const wins = u.gamePlayers.filter((gp) => gp.isWinner).length
      const losses = gamesPlayed - wins
      const winRate = gamesPlayed ? Math.round((wins / gamesPlayed) * 100) : 0
      return { username: u.username, wins, losses, gamesPlayed, winRate }
    })
    .filter((r) => r.gamesPlayed > 0)
    .sort((a, b) => b.wins - a.wins || b.winRate - a.winRate)

  res.json({ leaderboard: rows })
})

// GET /games/history — the current user's past matches
router.get('/games/history', async (req, res) => {
  const gamePlayers = await prisma.gamePlayer.findMany({
    where: { userId: req.user.id },
    include: {
      game: {
        include: {
          room: true,
          winner: true,
          players: { include: { user: true } },
        },
      },
    },
    orderBy: { game: { endedAt: 'desc' } },
    take: 50,
  })

  const history = gamePlayers
    .filter((gp) => gp.game.endedAt)
    .map((gp) => ({
      id: gp.game.id,
      roomCode: gp.game.room.roomCode,
      winner: gp.game.winner?.username ?? gp.game.winnerName ?? 'Unknown',
      endedAt: gp.game.endedAt,
      players: gp.game.players.map((p) => ({
        id: p.userId,
        name: p.user.username,
        cardsLeft: p.cardsLeft,
      })),
    }))

  res.json({ history })
})

export default router
