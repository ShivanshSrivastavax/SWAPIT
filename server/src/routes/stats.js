import { Router } from 'express'
import { getFirestoreDb } from '../lib/firebase.js'
import { asyncHandler } from '../lib/asyncHandler.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()
router.use(requireAuth)

router.get('/leaderboard', asyncHandler(async (req, res) => {
  const snapshot = await getFirestoreDb().collection('users').get()
  const leaderboard = snapshot.docs
    .map((doc) => {
      const user = doc.data()
      const gamesPlayed = user.gamesPlayed ?? 0
      const wins = user.wins ?? 0
      return {
        username: user.username,
        wins,
        losses: gamesPlayed - wins,
        gamesPlayed,
        winRate: gamesPlayed ? Math.round((wins / gamesPlayed) * 100) : 0,
      }
    })
    .filter((user) => user.gamesPlayed > 0)
    .sort((a, b) => b.wins - a.wins || b.winRate - a.winRate)

  res.json({ leaderboard })
}))

router.get('/games/history', asyncHandler(async (req, res) => {
  const snapshot = await getFirestoreDb()
    .collection('users')
    .doc(req.user.id)
    .collection('history')
    .orderBy('endedAt', 'desc')
    .limit(50)
    .get()

  const history = snapshot.docs.map((doc) => doc.data())
  res.json({ history })
}))

export default router
