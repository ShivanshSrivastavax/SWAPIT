import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import cookieParser from 'cookie-parser'
import { createServer } from 'http'
import { Server } from 'socket.io'

import authRoutes from './routes/auth.js'
import profileRoutes from './routes/profile.js'
import roomsRoutes from './routes/rooms.js'
import statsRoutes from './routes/stats.js'
import { registerSocketHandlers } from './sockets/index.js'

const app = express()
const server = createServer(app)

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173'

app.use(helmet({ contentSecurityPolicy: false }))
app.use(compression())
app.use(cors({ origin: CLIENT_URL, credentials: true }))
app.use(express.json())
app.use(cookieParser())

app.get('/health', (req, res) => res.json({ ok: true }))

app.use('/auth', authRoutes)
app.use('/profile', profileRoutes)
app.use('/rooms', roomsRoutes)
app.use('/', statsRoutes) // exposes /leaderboard and /games/history

app.use((err, req, res, next) => {
  console.error(err)
  res.status(err.status || 500).json({ error: err.message || 'Internal server error.' })
})

const io = new Server(server, {
  cors: { origin: CLIENT_URL, credentials: true },
})
registerSocketHandlers(io)

const PORT = process.env.PORT || 4000
server.listen(PORT, () => {
  console.log(`UNO server listening on http://localhost:${PORT}`)
})
