# MERN Project

Full-stack starter using **MongoDB**, **Express**, **React**, and **Node.js** with Vite for the frontend.

## Project Structure

```
mern_project/
├── backend/
│   ├── main.js        # Express server entry point
│   ├── router.js      # API routes
│   ├── database.js    # MongoDB connection
│   └── collector.js   # Controller functions
├── public/
├── src/
│   ├── assets/
│   ├── App.jsx
│   ├── App.css
│   ├── main.jsx
│   ├── New.jsx
│   └── index.css
├── .gitignore
├── eslint.config.js
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- [MongoDB](https://www.mongodb.com/) running locally or a MongoDB Atlas connection string

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the environment example and add your [Anakin](https://anakin.io) API key:

   ```bash
   cp .env.example .env
   ```

   Set `ANAKIN_API_KEY` in `.env`. The backend uses Anakin's universal URL scraper to fetch page content.

3. Start MongoDB locally (if not using Atlas).

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Run frontend and backend together |
| `npm run dev:client` | Run Vite dev server only (port 5173) |
| `npm run dev:server` | Run Express API only (port 5000) |
| `npm run build` | Build frontend for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/summarize` | Scrape URL via Anakin and return summary |
| POST | `/api/flashcards` | Generate flash cards from URL or content |
| POST | `/api/notes` | Generate study notes from URL or content |

## Development

Run both servers with:

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:5000

The Vite dev server proxies `/api` requests to the Express backend.
