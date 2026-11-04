import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import { createServer } from 'http'
import { Server } from 'socket.io'

import authRoutes from './routes/auth.js'
import profileRoutes from './routes/profile.js'
import roomsRoutes from './routes/rooms.js'
import statsRoutes from './routes/stats.js'
import { registerSocketHandlers } from './sockets/index.js'

const app = express()
const server = createServer(app)

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:4173'
const allowedOrigins = CLIENT_URL.split(',').map((origin) => origin.trim()).filter(Boolean)
const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true)
    callback(new Error('Origin is not allowed by CORS'))
  },
  credentials: true,
}

app.use(helmet({ contentSecurityPolicy: false }))
app.use(compression())
app.use(cors(corsOptions))
app.use(express.json())

app.get('/health', (req, res) => res.json({ ok: true, firebaseConfigured: Boolean(process.env.FIREBASE_PROJECT_ID) }))

app.use('/auth', authRoutes)
app.use('/profile', profileRoutes)
app.use('/rooms', roomsRoutes)
app.use('/', statsRoutes) // exposes /leaderboard and /games/history

app.use((err, req, res, next) => {
  console.error(err)
  const status = err.status || 500
  const message = status >= 500 ? 'The request could not be completed. Check the server configuration and logs.' : err.message
  res.status(status).json({ error: message || 'Internal server error.' })
})

const io = new Server(server, {
  cors: corsOptions,
})
registerSocketHandlers(io)

const PORT = process.env.PORT || 4100
server.listen(PORT, () => {
  console.log(`UNO server listening on http://localhost:${PORT}`)
})
