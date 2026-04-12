<div align="center">
  <img src="src/assets/img/preview.png" alt="EstateMind AI Preview" width="800" />
  <h1>EstateMind AI</h1>
  <p>AI-powered assistant platform for real estate agents — manage listings, FAQs, and let clients chat with your AI chatbot.</p>

  [![Live Demo](https://img.shields.io/badge/Live%20Demo-estatemind--ai.netlify.app-blue?style=for-the-badge)](https://estatemind-ai.netlify.app/)
</div>

---

## Overview

EstateMind AI is a full-stack web application that gives real estate agents their own AI-powered chatbot. Agents log in to manage their property listings and FAQs, which the AI uses as context to answer client questions in real time.

Clients access a public chatbot page — no account needed — and can get instant, accurate answers about properties, pricing, and more, all powered by Google Gemini.

## Features

- **Agent Dashboard** — manage properties, FAQs, chatbot settings, and view conversation history
- **AI Chatbot** — public-facing chatbot backed by Google Gemini, trained on the agent's listings and FAQs
- **Google Sign-In** — Firebase Authentication with role-based access (`agent` / `admin`)
- **Real-time Updates** — Firestore `onSnapshot` keeps the dashboard live without refreshing
- **Dark Mode** — fully themed UI with persistent dark/light toggle
- **Admin Panel** — manage all agents and platform-wide settings

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite 6, Tailwind CSS v4 |
| Routing | React Router v7 |
| Auth & DB | Firebase 11 (Google Auth + Firestore) |
| AI | Google Gemini (`@google/genai`) |
| Hosting | Netlify |

## Getting Started

**Prerequisites:** Node.js

1. Clone the repo and install dependencies:
   ```bash
   npm install
   ```

2. Set your Gemini API key in `.env.local`:
   ```
   GEMINI_API_KEY=your_key_here
   ```

3. Start the dev server:
   ```bash
   npm run dev
   ```
   App runs at `http://localhost:3000`

## Scripts

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run lint     # Type-check (tsc --noEmit)
npm run clean    # Remove dist/
```

## Live Demo

[https://estatemind-ai.netlify.app/](https://estatemind-ai.netlify.app/)
