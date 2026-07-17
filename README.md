# ⚔️ Todo Battle

> **Not your average to-do app.** Todo Battle is a real-time, multiplayer productivity game — where your task list becomes a weapon.

---

## What Makes It Different?

Most to-do apps are solo. Todo Battle is **competitive**.

Instead of quietly checking off tasks alone, you battle up to 2 other players in a shared arena. Everyone adds their own tasks for the day, and at the stroke of midnight — **whoever completed the most wins**. Points are earned in real-time, visible to everyone, and the pressure of being watched makes you actually get things done.

| Regular To-Do App | Todo Battle |
|---|---|
| Solo, private lists | Live multiplayer arena (up to 3 players) |
| No accountability | Opponents can see your progress in real-time |
| Static UI | Live countdown clock, real-time score updates |
| Just tasks | Tasks + Sketchpad + Banter Chat |
| No stakes | Winner declared at midnight via daily report |

---

## Features

- ⚔️ **Multiplayer Battle Arena** — Up to 3 players compete in the same daily session
- 📊 **Real-Time Scoreboard** — Points update live via Supabase Realtime as tasks are completed
- ✅ **Task System** — Add, complete, postpone, or mark tasks as "can't do" (each affects scoring differently)
- 🔐 **Custom Auth** — Username + password login with avatar picker (no email required)
- 🖌️ **Shared Sketchpad** — A collaborative drawing canvas visible to all arena participants
- 💬 **Banter Chat** — In-arena live messaging to trash-talk (or cheer on) your opponents
- 📜 **Battle History** — Review all past battles, results, and daily scores
- 🎉 **Midnight Daily Reports** — Auto-generated summary + confetti for the winner at 00:00

---

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React 19, Vite 8                    |
| Backend    | Supabase (Postgres + Realtime)      |
| Styling    | Vanilla CSS (sketch/monochrome UI)  |
| Auth       | Custom auth stored in Supabase      |
| Deploy     | Vercel                              |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project

### Installation

```bash
# Clone the repo
git clone <your-repo-url>
cd todo-battle

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Fill in your Supabase URL and anon key in .env

# Start the dev server
npm run dev
```

### Environment Variables

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## Project Structure

```
src/
├── components/
│   ├── BanterChat.jsx     # In-arena live chat
│   ├── BattleHero.jsx     # Live scoreboard / hero section
│   ├── Header.jsx         # Navigation & live countdown timer
│   ├── History.jsx        # Past battle results viewer
│   ├── Home.jsx           # Landing / lobby status
│   ├── Login.jsx          # Custom authentication screen
│   ├── Modals.jsx         # Add/Postpone/Daily Report modals
│   ├── SetupBattle.jsx    # Create a new battle lobby
│   ├── Sketchpad.jsx      # Shared collaborative canvas
│   ├── TaskCard.jsx       # Individual task card UI
│   └── TaskGrid.jsx       # Task list grid per player
├── context/
│   ├── AuthContext.jsx    # Auth state & session management
│   ├── BattleContext.jsx  # Battle state, scoring, Supabase Realtime
│   └── ToastContext.jsx   # Global toast notification system
├── App.jsx                # Root component + tab routing
├── main.jsx               # React entry point
└── supabaseClient.js      # Supabase client setup
```

---

## Author

**Ayush** — Built to explore real-time multiplayer state management, Supabase Realtime subscriptions, and competitive UX design patterns.
