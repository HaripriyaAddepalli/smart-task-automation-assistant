# Quick Start Guide

## 🚀 Start Developing in 30 Seconds

### Option 1: Docker (Recommended)
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f backend

# Open in browser
# Frontend: http://localhost:5173
# Backend: http://localhost:5000/health
```

### Option 2: Local Development
```bash
# Terminal 1 - Backend
cd backend
npm install
export MONGO_URI="mongodb://localhost:27017/smart-task-assistant"
export REDIS_URL="redis://localhost:6379"
npm run dev  # Starts on port 5000

# Terminal 2 - Frontend
cd frontend
npm install
npm run dev  # Starts on port 5173
```

### Option 3: Production Build
```bash
# Backend
npm --prefix backend run build
npm --prefix backend start

# Frontend
npm --prefix frontend run build
npm --prefix frontend run preview
```

---

## 📝 Important Files

### Configuration
- `.env` - Environment variables
- `docker-compose.yml` - Local development stack
- `.github/workflows/ci-cd.yml` - CI/CD pipeline

### Documentation
- `README.md` - Project overview
- `PRODUCTION.md` - Deployment guide
- `INSPECTION_REPORT.md` - Architecture details
- `COMPLETION_REPORT.md` - What was implemented

### Key Source Files

#### Backend
- `backend/src/index.ts` - Server entry point
- `backend/src/routes/` - API endpoints
- `backend/src/services/` - Business logic
- `backend/src/models/` - Database schemas
- `backend/src/middleware/` - Auth, validation, errors

#### Frontend
- `frontend/src/App.tsx` - Router setup
- `frontend/src/pages/` - Page components
- `frontend/src/services/api.ts` - API client
- `frontend/src/auth/` - Authentication helpers

---

## 🔧 Common Commands

### Development
```bash
# Watch mode
npm --prefix backend run dev
npm --prefix frontend run dev

# Tests
npm --prefix backend test

# Build
npm --prefix backend run build
npm --prefix frontend run build

# Type check
npm --prefix frontend run build  # TypeScript check included
```

### Docker
```bash
# Start
docker-compose up -d

# Stop
docker-compose down

# View logs
docker-compose logs service_name

# Rebuild
docker-compose up -d --build
```

### Debugging
```bash
# Backend logs
docker-compose logs -f backend

# MongoDB connection
docker-compose exec mongodb mongosh

# Redis CLI
docker-compose exec redis redis-cli

# Test database
npm --prefix backend test
```

---

## 🌐 API Routes

### Public
- `GET /health` - Server health check

### Authentication
- `POST /api/auth/google` - Google OAuth login
- `PUT /api/auth/onboarding` - Complete onboarding

### Tasks (Requires Auth)
- `POST /api/tasks` - Create task
- `GET /api/tasks` - List tasks
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Workspaces
- `POST /api/workspaces` - Create workspace
- `GET /api/workspaces` - List workspaces
- `GET /api/workspaces/:id/kanban` - Get Kanban board
- `POST /api/workspaces/:id/invite` - Invite member

### AI Features
- `POST /api/ai/chat` - AI chat
- `POST /api/ai/prioritize` - AI task prioritization

### Billing
- `POST /api/billing/checkout` - Create checkout session
- `POST /api/billing/portal` - Billing portal link
- `GET /api/billing/subscription` - Subscription info

### See `INSPECTION_REPORT.md` for full API documentation

---

## 📊 Database Models

- **User** - Authentication & preferences
- **Task** - Core task data
- **Workspace** - Team collaboration
- **WorkspaceMember** - Team members
- **AssignedTask** - Kanban assignments
- **UserStats** - Gamification data
- **Activity** - Audit logs

---

## 🔐 Environment Variables

**Required (Backend)**
```env
PORT=5000
MONGO_URI=mongodb://...
GROQ_API_KEY=gsk_...
FIREBASE_PROJECT_ID=smart-task-assistant-208e5
```

**Optional**
```env
REDIS_URL=redis://localhost:6379
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
TELEGRAM_BOT_TOKEN=...
TWILIO_ACCOUNT_SID=...
```

**Frontend**
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Find process using port
lsof -i :5000      # Backend
lsof -i :5173      # Frontend

# Kill process
kill -9 <PID>
```

### MongoDB Connection Failed
```bash
# Check if running
docker-compose logs mongodb

# Restart
docker-compose restart mongodb

# Manual connection string format
mongodb://admin:password@localhost:27017/database?authSource=admin
```

### Build Errors
```bash
# Clear cache
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build

# Check TypeScript errors
npm run build -- --listFiles
```

### Port 5173/5000 Already Allocated
```bash
# Change port in package.json or environment
export PORT=5001
npm run dev
```

---

## 📈 Performance

- Frontend bundle: 507 KB (161 KB gzipped)
- Build time: ~1 second
- Tests: ~45 seconds
- Docker image size: ~200 MB (backend), ~150 MB (frontend)

---

## ✨ New Features in This Release

✅ **Workspace Switcher** - Manage and switch between workspaces  
✅ **Settings Page** - Control notifications, billing, integrations  
✅ **Onboarding Wizard** - Guide new users through setup  
✅ **Landing Page** - Public-facing homepage  
✅ **Docker Support** - One-command local development  
✅ **GitHub Actions** - Automated CI/CD pipeline  
✅ **Production Guide** - Deployment documentation  
✅ **Google OAuth Fix** - Proper user persistence  

---

## 📚 Additional Resources

- `PRODUCTION.md` - Full deployment guide
- `INSPECTION_REPORT.md` - Architecture details
- `COMPLETION_REPORT.md` - Implementation summary
- GitHub Issues - Bug reports and feature requests
- Discussions - General questions and ideas

---

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/my-feature`
2. Make changes and test: `npm test && npm run build`
3. Commit: `git commit -m "Add my feature"`
4. Push: `git push origin feature/my-feature`
5. Create Pull Request

---

## 📞 Support

- Check logs: `docker-compose logs -f`
- Review `PRODUCTION.md` for troubleshooting
- See `INSPECTION_REPORT.md` for architecture questions
- Check `COMPLETION_REPORT.md` for recent changes

---

**Happy Coding! 🚀**
