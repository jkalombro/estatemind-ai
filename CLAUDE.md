# EstateMind AI

Real estate agent AI assistant platform — agents manage properties/FAQs, clients chat with an AI-powered chatbot backed by Google Gemini.

## Commands

```bash
npm run dev       # Start dev server on port 3000
npm run build     # Production build
npm run lint      # Type-check (tsc --noEmit)
npm run clean     # Remove dist/
```

## Stack

- **Frontend:** React 19, TypeScript, Vite 6, Tailwind CSS v4
- **Routing:** React Router v7
- **Auth & DB:** Firebase 11 (Google Auth + Firestore)
- **AI:** Google Gemini (`@google/genai`)
- **Icons:** lucide-react
- **Animations:** motion
- **Class util:** `cn()` = clsx + tailwind-merge

## Environment Variables

```
GEMINI_API_KEY   # Google Gemini API key (required)
APP_URL          # Hosting URL for OAuth callbacks
```

Firebase config is in `firebase-applet-config.json` (committed, not secret).

## Project Structure

```
src/
├── App.tsx                    # Auth context + top-level routing
├── Layout.tsx                 # Header, footer, nav wrapper
├── firebase.ts                # Firebase init & exports
├── pages/
│   ├── Home/HomePage.tsx      # Landing page
│   ├── Dashboard/             # Agent dashboard (auth required)
│   │   ├── DashboardPage.tsx
│   │   └── components/        # Overview, PropertyManager, FAQManager, ConversationManager, SettingsManager
│   ├── Chatbot/               # Public AI chatbot
│   │   ├── ChatbotPage.tsx
│   │   └── components/
│   └── Admin/                 # Admin panel (admin role required)
│       ├── AdminPage.tsx
│       └── components/
└── shared/
    ├── context/ThemeContext.tsx
    ├── services/gemini.ts     # Gemini API integration
    └── utils/
        ├── utils.ts           # cn() helper
        └── firestore.ts       # Error handling
```

## Routing

```
/              → Home (redirects to /dashboard if logged in)
/dashboard/*   → Agent dashboard (redirects to / if not authed)
/admin/*       → Admin panel (shows "Access Denied" if not admin)
/chatbot       → Public chatbot (no auth required)
```

Dashboard sub-routes: `/dashboard`, `/dashboard/properties`, `/dashboard/faqs`, `/dashboard/conversations`, `/dashboard/settings`

## Auth & Roles

- Google Sign-In via Firebase
- Roles: `agent` | `admin` (stored in Firestore `users` collection)
- `isBlocked` flag enforced on auth state change
- `useAuth()` hook for context access

## Firestore Collections

| Collection | Purpose |
|---|---|
| `users` | Profiles: role, email, displayName, isBlocked |
| `properties` | Listings: title, price, location, type, bedrooms, bathrooms, agentId |
| `faqs` | Q&A pairs: question, answer, agentId |
| `settings` | Per-agent chatbot config: name, avatar, welcome message, agencyName |
| `conversations` | Chat sessions: clientName, contactInfo, lastMessage, agentId |
| `messages` | Chat messages: text, sender ('user'|'bot'), conversationId, agentId |

## Key Conventions

- **State:** Context API + useState/useEffect; real-time updates via `onSnapshot`
- **Styling:** Tailwind with `dark:` prefix for dark mode; class-based dark mode toggled by ThemeContext and persisted to localStorage
- **TypeScript:** Strict — always run `npm run lint` before committing
- **Error handling:** `handleFirestoreError()` from `shared/utils/firestore.ts` for all Firestore ops
