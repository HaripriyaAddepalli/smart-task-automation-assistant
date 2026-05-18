# AI Smart Task Automation Assistant

A full-stack application that uses AI to automate task management through voice and text.

## Features
- **Voice-to-Task**: Uses Web Speech API to capture user commands.
- **AI Task Extraction**: Uses Claude 3 (via Anthropic SDK & LangChain) to parse natural language into structured tasks.
- **Smart Insights**: Provides AI-generated tips for each task.
- **Modular Architecture**: Clean separation of concerns between frontend, backend, and AI services.
- **Responsive Design**: Polished UI built with Vanilla CSS and React.

## Tech Stack
- **Frontend**: React 18, TypeScript, Vite, Lucide React, Axios.
- **Backend**: Node.js, Express, TypeScript, MongoDB (Mongoose).
- **AI**: Claude 3 (Anthropic SDK), LangChain (for structured output orchestration).
- **Speech**: Web Speech API.

## Getting Started

### Prerequisites
- Node.js (v16+)
- MongoDB (local or Atlas)
- Anthropic API Key

### Backend Setup
1. Navigate to `backend/`
2. Install dependencies: `npm install`
3. Create a `.env` file based on the provided template:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_uri
   ANTHROPIC_API_KEY=your_key
   ```
4. Start dev server: `npm run dev`

### Frontend Setup
1. Navigate to `frontend/`
2. Install dependencies: `npm install`
3. Create a `.env` file:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```
4. Start dev server: `npm run dev`

## Deployment
- **Backend**: Recommended for Railway.
- **Frontend**: Recommended for Vercel.
- Ensure environment variables are set in the respective hosting platforms.
