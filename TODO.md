# TODO — Production-Ready SaaS Upgrade (Phased)

## Phase 0 — Foundation & Standards
- [x] Add Zod request validation middleware (`backend/src/middleware/validate.ts`)
- [x] Add rate limiting (`backend/src/middleware/rateLimiter.ts`)
- [x] Add Helmet security hardening (`backend/src/index.ts`)
- [x] Add Winston logger (`backend/src/config/logger.ts`) and wire into startup + routes
- [x] Add auth middleware that verifies **Firebase ID tokens** (keep Firebase Auth)
- [x] Add standardized error handling for async routes
- [x] Add/adjust `.env` support notes for new variables (logger uses env optional)
- [x] Update backend route mounts to protect endpoints by auth
- [x] Ensure backend builds: run `npm --prefix backend run build`



## Phase 1 — AI Prioritization & Smart Deadline Engine
- [x] Add `POST /api/ai/prioritize` route
- [x] Implement prioritization service using Groq with strict JSON output
- [x] Add subtasks + realistic due-date suggestion + conflict detection
- [x] Add Zod schemas for request/response
- [x] Add Jest tests for AI prioritization service + controller


## Phase 2 — Collaboration (Workspaces + Kanban + Socket.io)
- [x] Add Mongoose models: `Workspace`, `WorkspaceMember`, `AssignedTask` (plus optional Activity)
- [x] Add REST routes for workspace CRUD + invite + task assignment
- [x] Implement Socket.io with shared HTTP server (same port as Express)
- [x] Update frontend: workspace switcher page + Kanban board (dnd-kit)
- [x] Wire socket events to update task statuses in real time

## Phase 3 — Email & Google Calendar Integration
- [x] Implement daily digest email job (Nodemailer)
- [x] Implement deadline reminders email job
- [x] Implement Google OAuth2 flow + token storage + sync jobs
- [x] Add routes:
  - [x] `POST /api/integrations/google-calendar`
  - [x] `POST /api/integrations/email-digest`

## Phase 4 — Gamification & Streaks
- [x] Add `UserStats` Mongoose model (xp/level/streak/badges)
- [x] Update task completion flow to grant XP and update streak/badges
- [x] Build frontend progress dashboard widget (Chart.js/Recharts)
- [x] Add leaderboard (optional per workspace)

## Phase 5 — WhatsApp & Telegram Notifications
- [x] Add `NotificationPreference` storage in User model
- [x] Implement Twilio WhatsApp integration
- [x] Implement Telegram bot integration
- [x] Add routes:
  - [x] `POST /api/notifications/whatsapp`
  - [x] `POST /api/notifications/telegram`
- [x] Add jobs for triggers (1h/1d before deadline, assignment, daily summary, streak milestones)

## Phase 6 — Architecture Upgrades (Stripe + Rate/Redis + Security)
- [x] Add Stripe integration with webhook signature verification
- [x] Implement subscription guard middleware
- [x] Enforce plan limits: Free/Pro/Team
- [x] Add Redis caching for AI responses
- [x] Add session management support as needed

## Phase 7 — Frontend SaaS Upgrade
- [x] Add Landing page + Pricing + CTA
- [x] Add Onboarding 3-step wizard
- [x] Add Settings page for notifications/integrations
- [x] Upgrade Dashboard to Kanban + Calendar + Gamification + Workspace switcher
- [x] Migrate API calls to React Query (TanStack Query)
- [x] Add dark mode toggle

## Phase 8 — Tests, Docker, CI, README
- [x] Jest unit tests (AI service + task controller/stats)
- [x] Add Docker Compose (backend/frontend/mongodb/redis)
- [x] Add GitHub Actions CI pipeline
- [x] Upgrade README with SaaS setup instructions


