# AI Smart Task Automation Assistant (Full-Stack)

A full-stack application that uses AI to automate task management through **voice** and **text**.

---

## Live (while running)
- **Frontend (Vite)**: http://localhost:5173
- **Backend (Express)**: http://localhost:5000
  - Health check: http://localhost:5000/health

---

## Features
- **Voice-to-Task**: Captures natural-language commands using the Web Speech API.
- **AI Task Extraction**: Uses **Groq/Claude-style structured prompting** (via SDK + LangChain) to convert natural language into structured tasks.
- **Smart Insights**: AI-generated tips/insights for tasks.
- **Analytics & Voice Routes**: Modular backend routes for tasks, AI, email, analytics, and voice.
- **Auth (Firebase)**: Frontend supports login/signup and route protection.

---

## Tech Stack
### Frontend
- React + TypeScript
- Vite
- React Router
- Axios
- Firebase (authentication)

### Backend
- Node.js + Express
- TypeScript
- MongoDB + Mongoose
- Nodemailer (email)
- node-cron (scheduled reminders)

---

## Prerequisites
- **Node.js** (v16+)
- **MongoDB** (local or Atlas)
- **AI API Key** (configured via environment variables; see backend section)

---

## Setup (Local Dev)
### 1) Backend

1. Go to `backend/`
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create `backend/.env`:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_uri
   GROQ_API_KEY=your_key
   ```
   > If your project uses additional keys (e.g., email/SMS/other), add them as required by the services.

4. Start dev server:
   ```bash
   npm run dev
   ```

Backend routes (base prefix):
- `/api/tasks`
- `/api/ai`
- `/api/email`
- `/api/analytics`
- `/api/voice`
- `/api/auth`

Health check:
- `GET /health`

---

### 2) Frontend

1. Go to `frontend/`
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create `frontend/.env`:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```
4. Start dev server:
   ```bash
   npm run dev
   ```

---

## Run Both (One-command guidance)
In two terminals:

**Terminal A (backend):**
```bash
cd c:/Users/harip/smart-task-automation-assistant
npm --prefix backend run dev
```

**Terminal B (frontend):**
```bash
cd c:/Users/harip/smart-task-automation-assistant
npm --prefix frontend run dev
```

---

## Project Structure
- `backend/`
  - `src/index.ts` (server bootstrap)
  - `src/routes/*` (Express routes)
  - `src/controllers/*` (route handlers)
  - `src/models/*` (Mongoose models)
  - `src/services/*` (AI, email, reminder, voice services)
  - `src/config/db.ts` (Mongo connection)

- `frontend/`
  - `src/main.tsx` (React entry)
  - `src/App.tsx` (router + providers)
  - `src/pages/*` (Login, Signup, Dashboard)
  - `src/services/api.ts` (Axios client)
  - `src/auth/*` (auth utilities & guards)
  - `src/components/*` (UI components like ChatBot)

---

## Testing / Build
- **Backend build**:
  ```bash
  npm --prefix backend run build
  ```

- **Frontend build**:
  ```bash
  npm --prefix frontend run build
  ```

---

## Notes / Troubleshooting
- If the frontend cannot call the backend, verify:
  - `frontend/.env` contains the correct `VITE_API_URL`
  - backend is running on the expected port (`5000` by default)
- Backend will fail at startup if `MONGO_URI` is missing/invalid.
- Reminder service starts when the server boots (see backend logs).

---

## License
Add license details here (if applicable).

