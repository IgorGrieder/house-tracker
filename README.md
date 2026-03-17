# House Tracker

**Keep your household in sync.**

House Tracker is a household management app for a single family to stay organized and in sync. Manage your shared calendar, shopping lists, chores, and expenses — all in one place.

## Features

- **Family Calendar** — Shared events, appointments, and reminders with day/week/month views. Events can be assigned to specific members or everyone, color-coded by member.
- **Shopping Lists** — Create categorized lists (groceries, household, etc.), check off items, shared across the family.
- **Chores / Tasks** — Assign tasks to family members, set recurrence (daily/weekly/monthly), track completion history.
- **Expenses Tracker** — Log household expenses, categorize spending, view monthly summaries and per-member breakdowns.

## Tech Stack

- **Runtime:** [Bun](https://bun.sh)
- **Backend:** [Elysia](https://elysiajs.com) (TypeScript)
- **Frontend:** [React](https://react.dev) + [Vite](https://vitejs.dev)
- **Database:** [MongoDB](https://www.mongodb.com) (Mongoose + Atlas)
- **Language:** TypeScript throughout

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) >= 1.0
- [MongoDB Atlas](https://www.mongodb.com/atlas) account (or local MongoDB)

### Setup

1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd house-tracker
   ```

2. Install dependencies:
   ```bash
   bun install
   ```

3. Create environment file:
   ```bash
   cp packages/server/.env.example packages/server/.env
   ```
   Fill in your MongoDB connection string and JWT secret.

4. Start the development servers:
   ```bash
   # Backend (Elysia)
   bun run dev:server

   # Frontend (React + Vite)
   bun run dev:web

   # Or both at once
   bun run dev
   ```

## Project Structure

```
house-tracker/
├── package.json            # Bun workspaces root
├── packages/
│   ├── server/             # Elysia backend
│   │   └── src/
│   │       ├── index.ts    # Entry point
│   │       ├── config/     # Env, DB connection
│   │       ├── models/     # Mongoose schemas
│   │       ├── routes/     # Elysia route modules
│   │       ├── middleware/  # Auth, error handling
│   │       └── utils/      # Helpers
│   ├── web/                # React + Vite frontend
│   │   └── src/
│   │       ├── main.tsx    # Entry point
│   │       ├── App.tsx     # Root component
│   │       ├── components/ # Reusable UI components
│   │       ├── pages/      # Route pages
│   │       ├── hooks/      # Custom React hooks
│   │       ├── services/   # API client calls
│   │       ├── store/      # State management
│   │       └── types/      # TypeScript types
│   └── shared/             # Shared types & constants
│       └── src/types/
```

## Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Test thoroughly
4. Open a pull request
