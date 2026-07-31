<div align="center">

# 🎴 SWAPIT — Real-Time Multiplayer UNO Online

[![React](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![TailwindCSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![Express](https://img.shields.io/badge/Backend-Express.js-000000?style=for-the-badge&logo=express)](https://expressjs.com/)
[![Socket.IO](https://img.shields.io/badge/Realtime-Socket.IO-010101?style=for-the-badge&logo=socketdotio)](https://socket.io/)
[![Prisma](https://img.shields.io/badge/ORM-Prisma%205-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-4169E1?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)

An ultra-modern, full-stack, real-time multiplayer **UNO (SwapIt)** web application built with a **3D Casino Oval Felt Table UI**, **Server-Authoritative Game Engine**, **Zero-Latency Web Audio Synthesizer**, and **PostgreSQL persistence**.

[Highlights](#-highlights--features) • [Quick Start](#-quick-start-local-development) • [Project Structure](#-project-structure) • [Architecture](#%EF%B8%8F-architecture--engine-details) • [Tech Stack](#%EF%B8%8F-tech-stack)

</div>

---

## 🌟 Highlights & Features

### 🎨 Modern 3D Casino Glassmorphism UI
- **3D Casino Felt Oval Table**: Realistic poker-table canvas with rich metallic trim, stacked card deck physics, active turn spotlights, and card fanning.
- **Dark Glassmorphism**: Premium frosted-glass cards, neon accent highlights, and smooth 60fps GPU-accelerated micro-animations.
- **Native Web Audio Synthesizer**: Zero-network-delay audio engine using browser-native Web Audio API for card flips, deal slides, turn chimes, UNO alerts, and victory fanfares.

### 🛡️ Server-Authoritative & Cheat-Proof Engine
- **Full Ruleset**: Skip, Reverse, Draw Two, Wild, Wild +4, UNO declaration, missed UNO catching, and draw stacking penalties.
- **Privacy & Security**: Clients only receive their own hand. Opponent hands are transmitted as card counts, preventing client-side inspection or memory hacking.
- **Competitive AI Bots**: Fill empty room slots with intelligent AI bots (0–3) that make automated tactical moves with human-like delays.

### 🔐 Full Authentication & Real-Time Presence
- **JWT & HTTP-Only Cookies**: Real registration/login with bcrypt password hashing, short-lived JWT access tokens, and httpOnly refresh tokens.
- **Live Room Management**: Create, join, or leave custom rooms with room codes.
- **In-Game Chat & Presence**: Live presence indicators and real-time chat powered by Socket.IO.
- **Leaderboards & Match History**: Wins, games played, win rate, and game history persisted directly to PostgreSQL.

---

## 📂 Project Structure

```
uno-game/
├── client/                  # React Frontend (Vite + Tailwind CSS + Zustand + Socket.IO)
│   ├── src/
│   │   ├── components/      # Glassmorphic UI, Card, Deck, 3D GameBoard, Navbar
│   │   ├── pages/           # Dashboard, Game, Room creation/join, Leaderboard
│   │   ├── store/           # Zustand state & real-time Socket handlers
│   │   └── utils/           # Web Audio Synthesizer & Client Game Rules
├── server/                  # Express REST API + Socket.IO Game Engine + Prisma ORM
│   ├── prisma/              # Database Schema & Migrations (PostgreSQL)
│   └── src/
│       ├── game/            # Pure functional game engine (deck, gameLogic, bots)
│       ├── routes/          # Auth, Profile, Room, and Leaderboard API endpoints
│       └── sockets/         # Real-time state manager & room handlers
└── docker-compose.yml       # Docker Compose setup for local database
```

---

## ⚡ Quick Start (Local Development)

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [PostgreSQL](https://www.postgresql.org/) database or [Docker](https://www.docker.com/)

---

### 1. Database Setup

Using **Docker**:
```bash
docker compose up -d postgres
```
*Or set `DATABASE_URL` in `server/.env` to point to any PostgreSQL database (Supabase, Neon, Railway).*

---

### 2. Backend Setup (`server`)

Open a terminal and run:

```bash
cd server

# Copy environment template
cp .env.example .env

# Install dependencies
npm install

# Push database schema & generate Prisma client
npx prisma generate
npx prisma db push

# Start backend server (runs on http://localhost:4000)
npm run dev
```

---

### 3. Frontend Setup (`client`)

Open a separate terminal and run:

```bash
cd client

# Copy environment template
cp .env.example .env

# Install dependencies
npm install

# Start Vite dev server (runs on http://localhost:5173)
npm run dev
```

> **🎮 Test Multiplayer locally:** Open `http://localhost:5173/` in two separate browser windows (or one normal + one incognito), register two users, create a room in one, join with the room code in the other, and play in real time!

---

## 🛠️ Tech Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, Zustand, Socket.IO Client |
| **Audio** | Native Web Audio API (Synthesized SFX & Fanfares) |
| **Backend** | Node.js, Express.js, Socket.IO, Compression |
| **Database & ORM** | PostgreSQL, Prisma ORM 5 |
| **Auth & Security** | JWT, bcrypt, Cookie-Parser, Helmet |

---

## 🏗️ Architecture & Engine Details

1. **Server-Authoritative Loop**: Game state resides in-memory on the server (`server/src/sockets/gameManager.js`). Client actions (`playCard`, `drawCard`, `declareUno`, `catchMissedUno`) are validated on the server before state broadcasts.
2. **Read-Only Client Engine**: The client keeps a pure copy of rule utilities (`client/src/utils/gameLogic.js`) strictly for optimistic UI driving (highlighting playable cards) without blocking network round-trips.
3. **Authenticated WebSockets**: Sockets authenticate via JWT token handshakes (`socket.handshake.auth.token`) ensuring room connections map to verified user accounts.

---

<div align="center">
  <sub>Built with ❤️ by Shivansh Srivastava</sub>
</div>
