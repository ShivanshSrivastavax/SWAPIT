# UNO Online

A full-stack, real-time multiplayer UNO game: React (Vite) frontend + Express/Socket.IO/PostgreSQL backend.

```
uno-game/
├── client/          # React frontend (Vite + Tailwind + Zustand + Socket.IO client)
├── server/          # Express API + Socket.IO server + Prisma/PostgreSQL
└── docker-compose.yml
```

## What's implemented

- **Auth** — real registration/login with bcrypt-hashed passwords, short-lived JWT access tokens, httpOnly-cookie refresh tokens.
- **Rooms** — create/join/leave via REST, backed by Postgres so room codes work across devices.
- **Real-time presence & chat** — Socket.IO rooms; players see each other join/leave and chat live.
- **Server-authoritative game engine** — the full UNO rule set (Skip, Reverse, Draw Two, Wild, Wild +4, UNO declare/catch, win detection) runs on the server. Clients only ever receive their own hand — everyone else's hand is sent as a card count, so there's no way to cheat by inspecting client state.
- **Bots** — rooms can be filled with bots (0–3); the server runs their turns automatically with a short delay for readability.
- **Persistence** — match results and per-player card counts are written to Postgres on game end; leaderboard and match history are computed from real data.
- **Docker Compose** — `docker compose up` runs Postgres + the API server together for local dev.

## Not implemented (intentionally out of scope)

- Friends/invites (Phase 8 in the original plan) — the schema has the tables (`friends`, `friend_requests`) but no routes/UI yet.
- Production deployment configs (Vercel/Render/etc.) — you'll want to set real secrets and CORS origins before deploying.

## Quick start (local dev)

**1. Start Postgres** (via Docker):
```bash
docker compose up -d postgres
```
Or point `DATABASE_URL` in `server/.env` at any Postgres instance (Supabase, Neon, Railway all have free tiers).

**2. Set up and run the server:**
```bash
cd server
cp .env.example .env      # edit DATABASE_URL/JWT secrets if not using the default compose setup
npm install
npx prisma migrate dev --name init
npm run dev                # http://localhost:4000
```

**3. Set up and run the client** (separate terminal):
```bash
cd client
cp .env.example .env       # VITE_API_URL, defaults to http://localhost:4000
npm install
npm run dev                 # http://localhost:5173
```

Open two browser windows (or one normal + one incognito) logged in as different users, create a room in one, join with the room code from the other, and play — it's genuinely real-time across both.

## Architecture notes

- **Game logic lives in `server/src/game/`** (`deck.js`, `gameLogic.js`, `bots.js`) — pure functions, no I/O. `server/src/sockets/gameManager.js` holds the live in-memory game state per room code and calls into these functions.
- **The client keeps a read-only copy** of `gameLogic.js` (`client/src/utils/`) purely so `canPlayCard`/`currentPlayer`/`topCard` can drive UI state (which cards look playable) without a round trip. The server re-validates every move — the client copy is never trusted as the source of truth.
- **Sockets are authenticated** via the same JWT used for the REST API (`socket.handshake.auth.token`), so a socket connection always maps to a real user.
# SWAPIT
