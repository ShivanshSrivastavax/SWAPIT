<div align="center">

# 🎴 SWAPIT — Real-Time Multiplayer UNO Online

[![React](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Firebase](https://img.shields.io/badge/Auth%20%26%20Data-Firebase-FFCA28?style=for-the-badge&logo=firebase)](https://firebase.google.com/)
[![Socket.IO](https://img.shields.io/badge/Realtime-Socket.IO-010101?style=for-the-badge&logo=socketdotio)](https://socket.io/)

A full-stack real-time multiplayer UNO game with Firebase Authentication, Firestore persistence, and a server-authoritative Socket.IO game engine.

[Highlights](#-highlights--features) • [Quick Start](#-quick-start-local-development) • [Architecture](#-architecture)

## Live Demo

- **Website:** [https://swapits.web.app](https://swapits.web.app)
- **Backend API:** [https://swapit-backend-109681970402.asia-southeast1.run.app](https://swapit-backend-109681970402.asia-southeast1.run.app)
- **Backend health:** [https://swapit-backend-109681970402.asia-southeast1.run.app/health](https://swapit-backend-109681970402.asia-southeast1.run.app/health)

</div>

---

## 🌟 Highlights & Features

- **Firebase Authentication**: Email/password sign-up and login, including username-based login.
- **Firestore persistence**: User profiles, unique usernames, rooms, match history, and leaderboard statistics.
- **Server-authoritative gameplay**: The Socket.IO server validates game actions and only sends each player their own cards.
- **Full UNO ruleset**: Skip, Reverse, Draw Two, Wild, Wild +4, UNO declaration, missed UNO catches, and bots.
- **Live multiplayer**: Room creation/joining, presence, and in-game chat.

## ⚡ Quick Start (Local Development)

### Prerequisites

- Node.js 20+
- A Firebase project with **Email/Password Authentication** enabled and **Cloud Firestore** created
- A Firebase web app configuration
- A Firebase service-account JSON file for the Express server (keep it outside the repository)

### 1. Configure Firebase

In Firebase Console:

1. Enable **Authentication → Sign-in method → Email/Password**.
2. Create a **Cloud Firestore** database.
3. Register a web app and copy its config values into `client/.env`.
4. Create/download a service-account key and set its file path in `server/.env`. Never commit this key.
5. Deploy the Firestore rules and index (`firestore.rules` and `firestore.indexes.json`) from the Firebase Console or with the Firebase CLI.

Copy the templates and fill in the values:

```powershell
Copy-Item client/.env.example client/.env
Copy-Item server/.env.example server/.env
```

Set these client variables from the Firebase web app config:

```dotenv
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_APP_ID=
```

Set these server variables:

```dotenv
FIREBASE_PROJECT_ID=
GOOGLE_APPLICATION_CREDENTIALS=
```

`GOOGLE_APPLICATION_CREDENTIALS` must point to the downloaded service-account JSON. The Admin SDK uses it for Firebase Authentication and Firestore access.

For Docker Compose, place the key at `server/firebase-service-account.json` (ignored by git), or set `FIREBASE_SERVICE_ACCOUNT_FILE` to its path before starting Compose.

### 2. Start the backend

```powershell
Set-Location server
npm install
npm run dev
```

The API and Socket.IO server run on http://localhost:4100.

### 3. Start the frontend

In another terminal:

```powershell
Set-Location client
npm install
npm run dev
```

Open http://localhost:4173.

## 🔐 Firestore Security

The application accesses Firestore through the Firebase Admin SDK on the server. Client-side database access is not needed; `firestore.rules` denies direct client reads and writes. Keep service-account keys out of source control and restrict access to the Firebase project.

## 🏗️ Architecture

- The React client uses Firebase Authentication for identity and sends Firebase ID tokens to the Express API and Socket.IO server.
- Express verifies tokens with the Firebase Admin SDK and stores user profiles, username indexes, rooms, match results, and statistics in Firestore.
- Socket.IO authenticates each connection and keeps the UNO game state server-side in memory.
- The frontend does not access Firestore directly.

### Existing accounts

Firebase Authentication is a separate identity store. Existing PostgreSQL/Supabase users and password hashes are not automatically copied; users must create accounts in the configured Firebase project unless a separate user-data migration is performed.

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, Zustand |
| **Authentication & data** | Firebase Authentication, Cloud Firestore, Firebase Admin SDK |
| **Backend** | Node.js, Express.js, Socket.IO |
| **Audio** | Web Audio API |
